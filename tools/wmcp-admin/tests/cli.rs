use std::{
    fs,
    io::{Read, Write},
    net::TcpListener,
    path::PathBuf,
    process::{Command, Stdio},
    time::{SystemTime, UNIX_EPOCH},
};

fn temp_dir() -> PathBuf {
    let path = std::env::temp_dir().join(format!(
        "wmcp-cli-test-{}-{}",
        std::process::id(),
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_nanos()
    ));
    fs::create_dir(&path).unwrap();
    path
}
fn cli() -> Command {
    Command::new(env!("CARGO_BIN_EXE_wmcp-admin"))
}
fn server(
    responses: Vec<(&'static str, &'static str)>,
) -> (String, std::thread::JoinHandle<Vec<String>>) {
    let listener = TcpListener::bind("127.0.0.1:0").unwrap();
    let base = format!("http://{}", listener.local_addr().unwrap());
    let handle = std::thread::spawn(move || {
        responses.into_iter().map(|(status, body)| {
            let (mut stream, _) = listener.accept().unwrap();
            stream.set_read_timeout(Some(std::time::Duration::from_secs(3))).unwrap();
            let mut buf = Vec::new(); let mut block = [0; 4096];
            loop {
                let n = stream.read(&mut block).unwrap(); if n == 0 { break; } buf.extend_from_slice(&block[..n]);
                if let Some(end) = buf.windows(4).position(|b| b == b"\r\n\r\n") {
                    let head = String::from_utf8_lossy(&buf[..end]);
                    let length = head.lines().find_map(|l| { let (k,v) = l.split_once(':')?; if k.eq_ignore_ascii_case("content-length") { v.trim().parse::<usize>().ok() } else { None } }).unwrap_or(0);
                    if buf.len() >= end + 4 + length { break; }
                }
            }
            stream.write_all(format!("HTTP/1.1 {status}\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{body}",body.len()).as_bytes()).unwrap();
            String::from_utf8(buf).unwrap()
        }).collect()
    });
    (base, handle)
}
#[test]
fn category_list_and_dry_run_need_no_token() {
    let rust = cli().args(["seed", "--list-categories"]).output().unwrap();
    assert!(rust.status.success());
    assert_eq!(String::from_utf8(rust.stdout).unwrap(), "  shopify-shoes            4 urls\n  shopify-apparel          4 urls\n  shopify-cpg              4 urls\n  shopify-beauty           3 urls\n  openapi-public           3 urls\n");
    let dir = temp_dir();
    let file = dir.join("urls.json");
    fs::write(&file, r#"["https://example.com/mcp"]"#).unwrap();
    let result = cli()
        .arg("submit")
        .arg(&file)
        .arg("--dry")
        .env_remove("ADMIN_TOKEN")
        .output()
        .unwrap();
    assert!(
        result.status.success(),
        "{}",
        String::from_utf8_lossy(&result.stderr)
    );
    assert!(String::from_utf8_lossy(&result.stdout).contains("https://example.com/mcp"));
    fs::remove_dir_all(dir).unwrap();
}
#[test]
fn seed_cli_encodes_urls_and_reports_success() {
    let (base, server) = server(vec![("200 OK", r#"{"adapter":"shopify","tools":[{}]}"#)]);
    let mut rust = cli()
        .args(["seed", "--base-url", &base, "--rate", "10000", "--fresh"])
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .spawn()
        .unwrap();
    rust.stdin
        .take()
        .unwrap()
        .write_all(b"# comment\nhttps://example.com/a?x=1&y=2\n")
        .unwrap();
    let result = rust.wait_with_output().unwrap();
    assert!(result.status.success());
    let output = String::from_utf8(result.stdout).unwrap();
    assert!(output.contains("shopify"));
    assert!(output.contains("# 1/1 OK"));
    let requests = server.join().unwrap();
    assert!(requests[0].starts_with(
        "GET /api/v1/tools?url=https%3A%2F%2Fexample.com%2Fa%3Fx%3D1%26y%3D2&fresh=1 "
    ));
}
#[test]
fn incomplete_crawl_preserves_previous_output_and_never_submits() {
    let (base, server) = server(vec![
        (
            "200 OK",
            r#"{"servers":[{"server":{"remotes":[{"type":"sse","url":"https://example.com/sse"}]} }],"metadata":{"nextCursor":"more"}}"#,
        ),
        ("503 Service Unavailable", "{}"),
    ]);
    let dir = temp_dir();
    let output = dir.join("harvest.json");
    fs::write(&output, "previous").unwrap();
    let result = cli()
        .args([
            "crawl",
            "--registry-url",
            &format!("{base}/servers"),
            "--base-url",
            &base,
            "--output",
        ])
        .arg(&output)
        .arg("--secondary")
        .arg(dir.join("none.json"))
        .env("ADMIN_TOKEN", "fixture-token")
        .output()
        .unwrap();
    assert!(!result.status.success());
    assert_eq!(fs::read_to_string(&output).unwrap(), "previous");
    let partial: Vec<String> =
        serde_json::from_slice(&fs::read(output.with_extension("partial.json")).unwrap()).unwrap();
    assert_eq!(partial, ["https://example.com/sse"]);
    let requests = server.join().unwrap();
    assert_eq!(requests.len(), 2);
    assert!(requests.iter().all(|r| r.starts_with("GET ")));
    fs::remove_dir_all(dir).unwrap();
}
#[test]
fn failed_batch_can_be_reviewed_and_resumed() {
    let (base, server) = server(vec![
        ("503 Service Unavailable", "{}"),
        ("503 Service Unavailable", "{}"),
        ("503 Service Unavailable", "{}"),
        (
            "200 OK",
            r#"{"accepted":1,"rejected":0,"newly_added":1,"queued_total":1}"#,
        ),
    ]);
    let dir = temp_dir();
    let input = dir.join("urls.json");
    let recovery = dir.join("recovery.json");
    fs::write(&input, r#"["https://example.com/mcp"]"#).unwrap();
    let failed = cli()
        .arg("submit")
        .arg(&input)
        .args(["--base-url", &base, "--failed-output"])
        .arg(&recovery)
        .env("ADMIN_TOKEN", "fixture-token")
        .output()
        .unwrap();
    assert!(!failed.status.success());
    let record: serde_json::Value = serde_json::from_slice(&fs::read(&recovery).unwrap()).unwrap();
    assert_eq!(record["items"][0], "https://example.com/mcp");
    let preview = cli()
        .arg("resume")
        .arg(&recovery)
        .arg("--dry")
        .env_remove("ADMIN_TOKEN")
        .output()
        .unwrap();
    assert!(preview.status.success());
    let resumed = cli()
        .arg("resume")
        .arg(&recovery)
        .env("ADMIN_TOKEN", "fixture-token")
        .output()
        .unwrap();
    assert!(
        resumed.status.success(),
        "{}",
        String::from_utf8_lossy(&resumed.stderr)
    );
    assert!(recovery.exists());
    let requests = server.join().unwrap();
    assert_eq!(requests.len(), 4);
    assert!(requests
        .iter()
        .all(|r| r.contains(r#"{"urls":["https://example.com/mcp"]}"#)));
    fs::remove_dir_all(dir).unwrap();
}
#[test]
fn shopify_empty_candidates_do_not_overwrite_output() {
    let dir = temp_dir();
    let input = dir.join("input.json");
    let output = dir.join("output.json");
    fs::write(&input, "[]").unwrap();
    fs::write(&output, "previous").unwrap();
    let result = cli()
        .arg("shopify-coverage")
        .arg("--input")
        .arg(&input)
        .arg("--output")
        .arg(&output)
        .output()
        .unwrap();
    assert!(!result.status.success());
    assert_eq!(fs::read_to_string(output).unwrap(), "previous");
    fs::remove_dir_all(dir).unwrap();
}

#[test]
fn submit_and_harvest_use_expected_api_contracts() {
    let dir = temp_dir();
    let urls = dir.join("urls.json");
    fs::write(&urls, r#"["https://example.com/mcp"]"#).unwrap();
    let response = r#"{"accepted":1,"rejected":0,"newly_added":1,"queued_total":1}"#;
    let (base, submit_server) = server(vec![("200 OK", response)]);
    let result = cli()
        .arg("submit")
        .arg(&urls)
        .args(["--base-url", &base])
        .env("ADMIN_TOKEN", "fixture-token")
        .output()
        .unwrap();
    assert!(result.status.success());
    let requests = submit_server.join().unwrap();
    assert!(requests[0].starts_with("POST /api/v1/admin/grade-servers "));
    let body = requests[0].split_once("\r\n\r\n").unwrap().1;
    assert_eq!(
        serde_json::from_str::<serde_json::Value>(body).unwrap(),
        serde_json::json!({"urls":["https://example.com/mcp"]})
    );
    let registry = r#"{"servers":[{"server":{"remotes":[{"type":"sse","url":"https://example.com/sse"}]}}],"metadata":{}}"#;
    let (base, server) = server(vec![("200 OK", registry)]);
    let output = dir.join("harvest.json");
    let result = cli()
        .args([
            "crawl",
            "--only-harvest",
            "--registry-url",
            &format!("{base}/servers"),
            "--output",
        ])
        .arg(&output)
        .arg("--secondary")
        .arg(dir.join("missing"))
        .output()
        .unwrap();
    assert!(
        result.status.success(),
        "{}",
        String::from_utf8_lossy(&result.stderr)
    );
    assert_eq!(
        serde_json::from_slice::<Vec<String>>(&fs::read(output).unwrap()).unwrap(),
        ["https://example.com/sse"]
    );
    assert_eq!(server.join().unwrap().len(), 1);
    fs::remove_dir_all(dir).unwrap();
}

#[test]
fn allow_partial_explicitly_saves_partial_harvest() {
    let (base, server) = server(vec![
        (
            "200 OK",
            r#"{"servers":[{"server":{"remotes":[{"type":"sse","url":"https://example.com/sse"}]}}],"metadata":{"nextCursor":"more"}}"#,
        ),
        ("503 Service Unavailable", "{}"),
    ]);
    let dir = temp_dir();
    let output = dir.join("harvest.json");
    let result = cli()
        .args([
            "crawl",
            "--only-harvest",
            "--allow-partial",
            "--registry-url",
            &format!("{base}/servers"),
            "--output",
        ])
        .arg(&output)
        .arg("--secondary")
        .arg(dir.join("missing"))
        .output()
        .unwrap();
    assert!(
        result.status.success(),
        "{}",
        String::from_utf8_lossy(&result.stderr)
    );
    assert_eq!(
        serde_json::from_slice::<Vec<String>>(&fs::read(&output).unwrap()).unwrap(),
        vec!["https://example.com/sse"]
    );
    server.join().unwrap();
    fs::remove_dir_all(dir).unwrap();
}
