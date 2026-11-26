use clap::Args;
use reqwest::{blocking::Client, Url};
use serde_json::{json, Value};
use std::{
    collections::BTreeSet,
    fs::{self, OpenOptions},
    io::Write,
    path::{Path, PathBuf},
    process::ExitCode,
    time::{Duration, SystemTime, UNIX_EPOCH},
};

type Result<T> = std::result::Result<T, Box<dyn std::error::Error>>;
const BASE: &str = "https://wmcp.sh";
const COVERAGE_UA: &str = "wmcp-coverage-agent/1.0 (+https://wmcp.sh/mcp/grade)";
const SHOPIFY_UA: &str = "wmcp-shopify-coverage/1.0 (+https://wmcp.sh/stores)";
const BLOCKED: &[&str] = &[
    "pokemoncenter.com",
    "popmart.com",
    "walmart.com",
    "target.com",
    "amazon.com",
    "bestbuy.com",
    "gamestop.com",
    "tcgplayer.com",
    "ebay.com",
    "nike.com",
    "footlocker.com",
    "snkrs.com",
    "stockx.com",
    "goat.com",
];
const FALLBACK: &[&str] = &[
    "stomptradingcards.com.au",
    "cardfaire.com",
    "hammverse.com",
    "vaultedculture.com",
    "rhydonmycards.com.au",
    "jinkiesco.com",
    "theshopcollectibles.com",
    "zenkaigames.co.nz",
    "eclipsepop.com",
    "dodogames.co.uk",
    "awesomedealsdeluxe.com",
    "skyboxct.com",
    "mallardcollectibles.com",
    "cutiemalta.com",
    "ttmartglobal.com",
    "redraideroutfitter.com",
    "jawnsonfire.com",
    "ikigaicases.com",
    "nagbags.ca",
    "onitathlete.com",
    "tcgcorner.com",
];

#[derive(Args)]
pub struct CrawlArgs {
    #[arg(long, default_value_t = 0)]
    max_submit: usize,
    #[arg(long, default_value_t = 200, value_parser = positive)]
    batch_size: usize,
    #[arg(long)]
    only_harvest: bool,
    /// Allow submission even when registry pagination fails or reaches its limit.
    #[arg(long)]
    allow_partial: bool,
    #[arg(long, default_value = BASE)]
    base_url: String,
    #[arg(
        long,
        default_value = "https://registry.modelcontextprotocol.io/v0/servers"
    )]
    registry_url: String,
    #[arg(long)]
    secondary: Option<PathBuf>,
    #[arg(long, default_value = "/tmp/wmcp_coverage_urls.json")]
    output: PathBuf,
    #[arg(long)]
    failed_output: Option<PathBuf>,
}
#[derive(Args)]
pub struct SubmitArgs {
    json_file: PathBuf,
    #[arg(long, default_value_t = 200, value_parser = positive)]
    batch_size: usize,
    #[arg(long, default_value_t = 0)]
    max: usize,
    #[arg(long)]
    dry: bool,
    #[arg(long, default_value = BASE)]
    base_url: String,
    #[arg(long)]
    failed_output: Option<PathBuf>,
}
#[derive(Args)]
pub struct ShopifyArgs {
    #[arg(long, default_value_t = 0)]
    max_submit: usize,
    #[arg(long, default_value_t = 100, value_parser = positive)]
    batch_size: usize,
    #[arg(long, default_value = BASE)]
    base_url: String,
    #[arg(long)]
    input: Option<PathBuf>,
    #[arg(long)]
    output: Option<PathBuf>,
    #[arg(long)]
    failed_output: Option<PathBuf>,
}
#[derive(Args)]
pub struct ResumeArgs {
    /// Recovery JSON produced by a failed submission. Use only trusted files.
    file: PathBuf,
    #[arg(long, default_value_t = 200, value_parser = positive)]
    batch_size: usize,
    #[arg(long)]
    dry: bool,
    #[arg(long)]
    failed_output: Option<PathBuf>,
}
fn positive(value: &str) -> std::result::Result<usize, String> {
    value
        .parse::<usize>()
        .ok()
        .filter(|v| *v > 0)
        .ok_or_else(|| "must be a positive integer".into())
}
pub fn run(result: Result<()>) -> ExitCode {
    match result {
        Ok(()) => ExitCode::SUCCESS,
        Err(e) => {
            eprintln!("ERROR: {e}");
            ExitCode::from(1)
        }
    }
}
fn client(ua: &str, timeout: u64) -> Result<Client> {
    Ok(Client::builder()
        .user_agent(ua)
        .timeout(Duration::from_secs(timeout))
        .build()?)
}
fn read_array(path: &Path) -> Result<Vec<String>> {
    let data: Vec<String> = serde_json::from_slice(&fs::read(path)?)?;
    Ok(data)
}
fn write_array(path: &Path, values: &[String]) -> Result<()> {
    atomic_write(path, &serde_json::to_vec_pretty(values)?)?;
    Ok(())
}
fn unique_suffix() -> u128 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_nanos()
}
fn atomic_write(path: &Path, data: &[u8]) -> Result<()> {
    let parent = path
        .parent()
        .filter(|p| !p.as_os_str().is_empty())
        .unwrap_or(Path::new("."));
    let name = path
        .file_name()
        .ok_or("output path must name a file")?
        .to_string_lossy();
    let temp = parent.join(format!(
        ".{name}.{}.{}.tmp",
        std::process::id(),
        unique_suffix()
    ));
    let result = (|| -> Result<()> {
        let mut file = OpenOptions::new()
            .write(true)
            .create_new(true)
            .open(&temp)?;
        file.write_all(data)?;
        file.sync_all()?;
        fs::rename(&temp, path)?;
        Ok(())
    })();
    if result.is_err() {
        let _ = fs::remove_file(temp);
    }
    result
}
fn token() -> Result<String> {
    let token = std::env::var("ADMIN_TOKEN")
        .unwrap_or_default()
        .trim()
        .to_owned();
    if token.is_empty() {
        return Err("ADMIN_TOKEN is required for submission".into());
    }
    Ok(token)
}
#[derive(Default, Debug)]
struct Totals {
    accepted: u64,
    rejected: u64,
    newly_added: u64,
    last_total: u64,
    failed: Vec<String>,
}
fn post_batches(
    client: &Client,
    base: &str,
    key: &str,
    values: &[String],
    batch_size: usize,
    token: &str,
) -> Totals {
    let endpoint = if key == "stores" {
        "/api/v1/admin/seed-stores"
    } else {
        "/api/v1/admin/grade-servers"
    };
    let mut totals = Totals::default();
    for (i, batch) in values.chunks(batch_size).enumerate() {
        println!("[submit] batch {} size={} ...", i + 1, batch.len());
        let mut result = Err("submission was not attempted".to_owned());
        for attempt in 0..3 {
            let response = client
                .post(format!("{}{}", base.trim_end_matches('/'), endpoint))
                .header("x-admin-token", token)
                .json(&json!({key: batch}))
                .send();
            let (outcome, retry) = match response {
                Ok(response) if response.status().is_success() => {
                    (response.json::<Value>().map_err(|e| e.to_string()), false)
                }
                Ok(response) => {
                    let status = response.status();
                    (
                        Err(format!("HTTP {status}")),
                        status.as_u16() == 429 || status.is_server_error(),
                    )
                }
                Err(error) => {
                    let retry = error.is_connect() || error.is_timeout();
                    (Err(error.to_string()), retry)
                }
            };
            result = outcome;
            if result.is_ok() || !retry || attempt == 2 {
                break;
            }
            eprintln!("  transient error; retrying batch {}", i + 1);
            std::thread::sleep(Duration::from_millis(250 * (1 << attempt)));
        }
        match result {
            Ok(value)
                if value["accepted"]
                    .as_u64()
                    .zip(value["rejected"].as_u64())
                    .and_then(|(accepted, rejected)| accepted.checked_add(rejected))
                    == Some(batch.len() as u64) =>
            {
                println!("  -> {value}");
                totals.accepted += value["accepted"].as_u64().unwrap_or(0);
                totals.rejected += value["rejected"].as_u64().unwrap_or(0);
                if value["rejected"].as_u64().unwrap_or(0) > 0 {
                    eprintln!("  API rejected items; recording entire batch for review");
                    totals.failed.extend_from_slice(batch);
                }
                totals.newly_added += value["newly_added"].as_u64().unwrap_or(0);
                let last_key = if key == "stores" {
                    "total_stores_in_list"
                } else {
                    "queued_total"
                };
                totals.last_total = value[last_key].as_u64().unwrap_or(totals.last_total);
            }
            Ok(_) => {
                eprintln!("  SUBMIT ERROR: invalid accepted/rejected counts; recording batch");
                totals.failed.extend_from_slice(batch);
                if key == "stores" {
                    totals
                        .failed
                        .extend_from_slice(&values[((i + 1) * batch_size).min(values.len())..]);
                    break;
                }
            }
            Err(error) => {
                eprintln!("  SUBMIT ERROR: {error}");
                totals.failed.extend_from_slice(batch);
                totals.rejected += batch.len() as u64;
                if key == "stores" {
                    totals
                        .failed
                        .extend_from_slice(&values[((i + 1) * batch_size).min(values.len())..]);
                    break;
                }
            }
        }
        std::thread::sleep(Duration::from_millis(500));
    }
    totals
}
fn save_failures(result: &Totals, key: &str, base: &str, path: Option<PathBuf>) -> Result<()> {
    if result.failed.is_empty() {
        return Ok(());
    }
    let path = path.unwrap_or_else(|| {
        std::env::temp_dir().join(format!(
            "wmcp-failed-{}-{}.json",
            std::process::id(),
            unique_suffix()
        ))
    });
    let record = json!({"version": 1, "kind": key, "base_url": base, "items": result.failed});
    let mut file = OpenOptions::new()
        .write(true)
        .create_new(true)
        .open(&path)?;
    file.write_all(&serde_json::to_vec_pretty(&record)?)?;
    file.sync_all()?;
    eprintln!(
        "Recovery file saved to {} (may include accepted items; review before resuming)",
        path.display()
    );
    Err("one or more batches failed or contained rejected items".into())
}
fn check_recovery_path(path: &Option<PathBuf>) -> Result<()> {
    if let Some(path) = path {
        if path.exists() {
            return Err(format!("recovery file already exists: {}", path.display()).into());
        }
    }
    Ok(())
}
pub fn submit(args: SubmitArgs) -> Result<()> {
    let mut urls = read_array(&args.json_file)?;
    if args.max > 0 {
        urls.truncate(args.max);
    }
    println!(
        "Loaded {} urls from {}",
        urls.len(),
        args.json_file.display()
    );
    if args.dry {
        for (i, batch) in urls.chunks(args.batch_size).enumerate() {
            println!(
                "Batch {}: {} urls ...\n  (dry) would POST first 3: {:?}",
                i + 1,
                batch.len(),
                &batch[..batch.len().min(3)]
            );
        }
        return Ok(());
    }
    check_recovery_path(&args.failed_output)?;
    let token = token()?;
    let result = post_batches(
        &client("wmcp-coverage-agent/1.0 (+https://wmcp.sh)", 30)?,
        &args.base_url,
        "urls",
        &urls,
        args.batch_size,
        &token,
    );
    println!(
        "Done. newly_added {}, last queued_total {}",
        result.newly_added, result.last_total
    );
    save_failures(&result, "urls", &args.base_url, args.failed_output)
}
pub fn resume(args: ResumeArgs) -> Result<()> {
    let record: Value = serde_json::from_slice(&fs::read(&args.file)?)?;
    if record["version"].as_u64() != Some(1) {
        return Err("unsupported recovery file version".into());
    }
    let key = record["kind"]
        .as_str()
        .filter(|kind| *kind == "urls" || *kind == "stores")
        .ok_or("invalid recovery kind")?;
    let base = record["base_url"]
        .as_str()
        .ok_or("missing recovery base_url")?;
    let items: Vec<String> = serde_json::from_value(record["items"].clone())?;
    println!("Recovery: {} {key} for {base}", items.len());
    if args.dry {
        for chunk in items.chunks(args.batch_size) {
            println!(
                "  {} items: {:?}",
                chunk.len(),
                &chunk[..chunk.len().min(3)]
            );
        }
        return Ok(());
    }
    check_recovery_path(&args.failed_output)?;
    let token = token()?;
    let result = post_batches(
        &client(
            if key == "stores" {
                SHOPIFY_UA
            } else {
                COVERAGE_UA
            },
            30,
        )?,
        base,
        key,
        &items,
        args.batch_size,
        &token,
    );
    save_failures(&result, key, base, args.failed_output)
}
fn clean_urls(raw: impl IntoIterator<Item = String>) -> Vec<String> {
    let mut good = BTreeSet::new();
    for value in raw {
        if let Ok(url) = Url::parse(value.trim()) {
            let Some(host) = url.host_str() else { continue };
            let host = host.to_lowercase();
            if url.scheme() != "https"
                || host.contains("localhost")
                || host.starts_with("127.")
                || host.starts_with("192.168.")
                || host.starts_with("10.")
            {
                continue;
            }
            let authority = match url.port() {
                Some(port) => format!("{host}:{port}"),
                None => host.clone(),
            };
            let path = url.path();
            let searchable = format!("{host}{path}").to_lowercase();
            if path == "/"
                || ["/mcp", "/sse", "mcp-server", "mcp.sse"]
                    .iter()
                    .any(|term| searchable.contains(term))
            {
                good.insert(
                    format!("https://{authority}{path}")
                        .trim_end_matches('/')
                        .to_owned(),
                );
            }
        }
    }
    good.into_iter().collect()
}
pub fn crawl(args: CrawlArgs) -> Result<()> {
    let http = client(COVERAGE_UA, 25)?;
    let mut raw = BTreeSet::new();
    let mut cursor = String::new();
    let mut complete = false;
    for page in 0..300 {
        let mut request = http.get(&args.registry_url).query(&[("limit", "100")]);
        if !cursor.is_empty() {
            request = request.query(&[("cursor", cursor.as_str())]);
        }
        let response: Value = match request
            .send()
            .and_then(|r| r.error_for_status())
            .and_then(|r| r.json())
        {
            Ok(value) => value,
            Err(error) => {
                eprintln!("[registry] fetch error page {page}: {error}");
                break;
            }
        };
        let Some(servers) = response["servers"].as_array() else {
            eprintln!("[registry] invalid response: servers must be an array");
            break;
        };
        for server in servers {
            if let Some(remotes) = server["server"]["remotes"].as_array() {
                for remote in remotes {
                    if matches!(remote["type"].as_str(), Some("streamable-http" | "sse")) {
                        if let Some(url) = remote["url"]
                            .as_str()
                            .map(str::trim)
                            .filter(|u| u.starts_with("https://"))
                        {
                            raw.insert(url.to_owned());
                        }
                    }
                }
            }
        }
        cursor = response["metadata"]["nextCursor"]
            .as_str()
            .unwrap_or("")
            .to_owned();
        println!(
            "[registry] page {}: +{} entries, total={}, cursor={}",
            page + 1,
            servers.len(),
            raw.len(),
            if cursor.is_empty() { "(end)" } else { &cursor }
        );
        if cursor.is_empty() {
            complete = true;
            break;
        }
        std::thread::sleep(Duration::from_millis(100));
    }
    let secondary = args
        .secondary
        .map(|p| vec![p])
        .unwrap_or_else(|| vec![std::env::temp_dir().join("pulsemcp_extracted.json")]);
    for path in secondary {
        if let Ok(urls) = read_array(&path) {
            for url in urls {
                if url.starts_with("https://") {
                    let clean = url
                        .split_whitespace()
                        .next()
                        .unwrap_or("")
                        .trim_end_matches(['.', ',', ';', '"', '\'', '<', '>', '(', ')', '[', ']']);
                    raw.insert(clean.to_owned());
                }
            }
        }
    }
    let cleaned = clean_urls(raw);
    if !complete && !args.allow_partial {
        let partial = args.output.with_extension("partial.json");
        write_array(&partial, &cleaned)?;
        return Err(format!("registry crawl incomplete; partial results saved to {}; no submission performed (use --allow-partial to override)", partial.display()).into());
    }
    if !complete {
        eprintln!("[registry] incomplete crawl; continuing because --allow-partial was set");
    }
    write_array(&args.output, &cleaned)?;
    println!(
        "After clean/normalize/dedup: {} URLs\nSaved cleaned list -> {}",
        cleaned.len(),
        args.output.display()
    );
    if args.only_harvest || cleaned.is_empty() {
        return Ok(());
    }
    check_recovery_path(&args.failed_output)?;
    let token = token()?;
    let end = if args.max_submit == 0 {
        cleaned.len()
    } else {
        args.max_submit.min(cleaned.len())
    };
    let result = post_batches(
        &client(COVERAGE_UA, 30)?,
        &args.base_url,
        "urls",
        &cleaned[..end],
        args.batch_size,
        &token,
    );
    println!(
        "accepted={} rejected={} newly_added={} queued_total={}",
        result.accepted, result.rejected, result.newly_added, result.last_total
    );
    match http
        .get(format!(
            "{}/api/v1/stats/public",
            args.base_url.trim_end_matches('/')
        ))
        .send()
        .and_then(|r| r.error_for_status())
        .and_then(|r| r.json::<Value>())
    {
        Ok(stats) => println!("Public stats after run: {stats}"),
        Err(e) => eprintln!("Could not fetch stats: {e}"),
    }
    save_failures(&result, "urls", &args.base_url, args.failed_output)
}
fn clean_hosts(raw: Vec<String>) -> Vec<String> {
    let mut good = BTreeSet::new();
    for value in raw {
        let value = value.trim().to_lowercase();
        let candidate = if value.contains("://") {
            value
        } else {
            format!("https://{value}")
        };
        if let Ok(url) = Url::parse(&candidate) {
            if let Some(host) = url.host_str() {
                let host = host.replace("www.", "");
                if !BLOCKED.contains(&host.as_str())
                    && !["shopify.com", "myshopify", "localhost", "127.", "192.168"]
                        .iter()
                        .any(|s| host.contains(s))
                {
                    good.insert(host);
                }
            }
        }
    }
    good.into_iter().collect()
}
#[derive(Debug, PartialEq)]
enum Confirmation {
    Confirmed,
    NotShopify,
    Unavailable,
}

fn confirm_shopify(http: &Client, host: &str) -> Confirmation {
    if [
        "localhost",
        "127.",
        "192.168",
        "10.",
        "shopify.com",
        "myshopify",
    ]
    .iter()
    .any(|s| host.contains(s))
    {
        return Confirmation::NotShopify;
    }
    confirm_shopify_at(http, &format!("https://{host}"))
}

fn confirm_shopify_at(http: &Client, base: &str) -> Confirmation {
    let products = http
        .get(format!("{base}/products.json?limit=1"))
        .timeout(Duration::from_secs(7))
        .header("accept", "application/json")
        .send()
        .and_then(|r| r.error_for_status())
        .and_then(|r| r.json::<Value>());
    if products
        .as_ref()
        .ok()
        .and_then(|v| v["products"].as_array().map(|a| !a.is_empty()))
        .unwrap_or(false)
    {
        return Confirmation::Confirmed;
    }
    let page = http
        .get(format!("{base}/"))
        .timeout(Duration::from_secs(6))
        .send()
        .and_then(|r| r.error_for_status())
        .and_then(|r| r.text());
    match page {
        Ok(p) => {
            let p = p.to_lowercase();
            if ["cdn.shopify.com", "shopify.theme", "id=\"shopify-section"]
                .iter()
                .any(|s| p.contains(s))
            {
                Confirmation::Confirmed
            } else {
                Confirmation::NotShopify
            }
        }
        Err(_)
            if products
                .as_ref()
                .ok()
                .and_then(|v| v["products"].as_array())
                .is_some() =>
        {
            Confirmation::NotShopify
        }
        Err(_) => Confirmation::Unavailable,
    }
}
fn ensure_safe_confirmation(checked: usize, unavailable: usize, confirmed: usize) -> Result<()> {
    if checked == 0 || confirmed == 0 || (unavailable > 0 && unavailable * 2 >= checked) {
        return Err(format!("confirmation incomplete or empty ({checked} checked, {unavailable} unavailable, {confirmed} confirmed); output preserved and nothing submitted").into());
    }
    Ok(())
}
pub fn shopify(args: ShopifyArgs) -> Result<()> {
    if args.max_submit > 0 {
        check_recovery_path(&args.failed_output)?;
    }
    let default_input = std::env::temp_dir().join("shopify_good_hosts.json");
    let raw = match args.input.as_ref() {
        Some(path) => read_array(path)?,
        None => read_array(&default_input)
            .unwrap_or_else(|_| FALLBACK.iter().map(|s| s.to_string()).collect()),
    };
    println!("[load] {} seed candidates", raw.len());
    let hosts = clean_hosts(raw);
    println!("[clean] {} after dedupe + blocklist", hosts.len());
    let http = client(SHOPIFY_UA, 10)?;
    let mut confirmed = Vec::new();
    let mut unavailable = 0;
    let checked = hosts.len().min(200);
    for host in hosts.iter().take(200) {
        match confirm_shopify(&http, host) {
            Confirmation::Confirmed => {
                println!("  ✓ {host}");
                confirmed.push(host.clone());
            }
            Confirmation::NotShopify => println!("  ✗ {host}"),
            Confirmation::Unavailable => {
                eprintln!("  ? {host} (unavailable)");
                unavailable += 1;
            }
        }
        std::thread::sleep(Duration::from_millis(400));
    }
    let output = args.output.unwrap_or(default_input);
    ensure_safe_confirmation(checked, unavailable, confirmed.len())?;
    write_array(&output, &confirmed)?;
    println!("[write] {} ({})", output.display(), confirmed.len());
    if args.max_submit == 0 {
        println!("[submit] skipped (--max-submit 0)");
        return Ok(());
    }
    let token = token()?;
    let end = args.max_submit.min(confirmed.len());
    let result = post_batches(
        &client(SHOPIFY_UA, 30)?,
        &args.base_url,
        "stores",
        &confirmed[..end],
        args.batch_size,
        &token,
    );
    println!(
        "accepted={} rejected={} newly_added={} total_in_list={}",
        result.accepted, result.rejected, result.newly_added, result.last_total
    );
    save_failures(&result, "stores", &args.base_url, args.failed_output)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::{
        io::{Read, Write},
        net::TcpListener,
    };

    fn server(
        responses: Vec<(&'static str, &'static str)>,
    ) -> (String, std::thread::JoinHandle<Vec<String>>) {
        let listener = TcpListener::bind("127.0.0.1:0").unwrap();
        let base = format!("http://{}", listener.local_addr().unwrap());
        let handle = std::thread::spawn(move || {
            let mut requests = Vec::new();
            for (status, body) in responses {
                let (mut stream, _) = listener.accept().unwrap();
                stream
                    .set_read_timeout(Some(Duration::from_secs(3)))
                    .unwrap();
                let mut request = Vec::new();
                let mut buffer = [0; 4096];
                loop {
                    let size = stream.read(&mut buffer).unwrap();
                    if size == 0 {
                        break;
                    }
                    request.extend_from_slice(&buffer[..size]);
                    if let Some(end) = request.windows(4).position(|w| w == b"\r\n\r\n") {
                        let headers = String::from_utf8_lossy(&request[..end]);
                        let length = headers
                            .lines()
                            .find_map(|line| {
                                let (key, value) = line.split_once(':')?;
                                key.eq_ignore_ascii_case("content-length")
                                    .then(|| value.trim().parse::<usize>().ok())
                                    .flatten()
                            })
                            .unwrap_or(0);
                        if request.len() >= end + 4 + length {
                            break;
                        }
                    }
                }
                stream.write_all(format!("HTTP/1.1 {status}\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{body}", body.len()).as_bytes()).unwrap();
                requests.push(String::from_utf8(request).unwrap());
            }
            requests
        });
        (base, handle)
    }
    #[test]
    fn cleans_registry_urls_and_deduplicates() {
        let input = [
            "https://EXAMPLE.com/mcp/?key=secret",
            "https://example.com/mcp/",
            "https://example.com/",
            "http://example.com/mcp",
            "https://127.0.0.1/mcp",
            "https://example.com/other",
        ];
        assert_eq!(
            clean_urls(input.into_iter().map(str::to_owned)),
            vec!["https://example.com", "https://example.com/mcp"]
        );
    }
    #[test]
    fn cleans_and_blocks_store_hosts() {
        let hosts = [
            "https://www.example.com/products/1",
            "example.com",
            "https://amazon.com",
            "myshopify.com",
            "localhost",
        ];
        assert_eq!(
            clean_hosts(hosts.into_iter().map(str::to_owned).collect()),
            vec!["example.com"]
        );
    }
    #[test]
    fn rejects_zero_batch_size() {
        assert!(positive("0").is_err());
        assert_eq!(positive("2"), Ok(2));
    }

    #[test]
    fn batches_include_admin_header_and_keep_going_after_failure() {
        let (base, server) = server(vec![
            ("400 Bad Request", "{}"),
            (
                "200 OK",
                r#"{"accepted":1,"rejected":0,"newly_added":1,"queued_total":7}"#,
            ),
        ]);
        let values = vec![
            "https://a.test/mcp".to_owned(),
            "https://b.test/mcp".to_owned(),
        ];
        let result = post_batches(&Client::new(), &base, "urls", &values, 1, "test-token");
        assert_eq!(result.failed, vec![values[0].clone()]);
        assert_eq!(
            (
                result.rejected,
                result.accepted,
                result.newly_added,
                result.last_total
            ),
            (1, 1, 1, 7)
        );
        let requests = server.join().unwrap();
        assert!(requests[0]
            .to_lowercase()
            .contains("x-admin-token: test-token"));
        assert!(requests[0].starts_with("POST /api/v1/admin/grade-servers"));
        assert!(requests[1].contains(r#"{"urls":["https://b.test/mcp"]}"#));
    }

    #[test]
    fn crawl_follows_cursor_and_saves_harvest_without_token() {
        let (base, server) = server(vec![
            (
                "200 OK",
                r#"{"servers":[{"server":{"remotes":[{"type":"sse","url":"https://example.com/sse?x=1"}]} }],"metadata":{"nextCursor":"next page"}}"#,
            ),
            (
                "200 OK",
                r#"{"servers":[{"server":{"remotes":[{"type":"streamable-http","url":"https://example.com/mcp"}]}}],"metadata":{}}"#,
            ),
        ]);
        let output =
            std::env::temp_dir().join(format!("wmcp-crawl-test-{}.json", std::process::id()));
        let args = CrawlArgs {
            max_submit: 0,
            batch_size: 200,
            only_harvest: true,
            allow_partial: false,
            base_url: base.clone(),
            registry_url: format!("{base}/servers"),
            secondary: Some(output.with_extension("missing")),
            output: output.clone(),
            failed_output: None,
        };
        crawl(args).unwrap();
        assert_eq!(
            read_array(&output).unwrap(),
            vec!["https://example.com/mcp", "https://example.com/sse"]
        );
        fs::remove_file(output).unwrap();
        let requests = server.join().unwrap();
        assert!(requests[1].contains("cursor=next+page"));
    }

    #[test]
    fn shopify_confirmation_uses_homepage_fallback() {
        let (base, server) = server(vec![
            ("403 Forbidden", "blocked"),
            (
                "200 OK",
                "<script src='https://cdn.shopify.com/a.js'></script>",
            ),
        ]);
        assert_eq!(
            confirm_shopify_at(&Client::new(), &base),
            Confirmation::Confirmed
        );
        let requests = server.join().unwrap();
        assert!(requests[0].starts_with("GET /products.json?limit=1"));
        assert!(requests[1].starts_with("GET / "));
    }

    #[test]
    fn preserves_output_on_widespread_unavailability() {
        assert!(ensure_safe_confirmation(4, 2, 1).is_err());
        assert!(ensure_safe_confirmation(4, 1, 2).is_ok());
        assert!(ensure_safe_confirmation(4, 0, 0).is_err());
    }

    #[test]
    fn retries_transient_errors_but_records_api_rejections() {
        let (base, server) = server(vec![
            ("503 Service Unavailable", "{}"),
            (
                "200 OK",
                r#"{"accepted":0,"rejected":1,"newly_added":0,"queued_total":0}"#,
            ),
        ]);
        let values = vec!["https://example.com/mcp".to_string()];
        let result = post_batches(&Client::new(), &base, "urls", &values, 1, "token");
        assert_eq!(result.failed, values);
        assert_eq!(result.rejected, 1);
        assert_eq!(server.join().unwrap().len(), 2);
    }

    #[test]
    fn store_failure_records_unattempted_batches() {
        let (base, server) = server(vec![("400 Bad Request", "{}")]);
        let values = vec![
            "a.example".to_string(),
            "b.example".to_string(),
            "c.example".to_string(),
        ];
        let result = post_batches(&Client::new(), &base, "stores", &values, 1, "token");
        assert_eq!(result.failed, values);
        assert_eq!(server.join().unwrap().len(), 1);
    }

    #[test]
    fn shopify_product_confirmation_matches_python() {
        let (base, server) = server(vec![
            ("200 OK", r#"{"products":[{"id":1}]}"#),
            ("200 OK", r#"{"products":[{"id":1}]}"#),
        ]);
        let script = "import sys;sys.path.insert(0,sys.argv[1]);import shopify_store_coverage as m;base=sys.argv[2];get=m.http_get;m.http_get=lambda u,**kw:get(base+'/products.json?limit=1',**kw);print(m.confirm_shopify('example.com'))";
        let python = std::process::Command::new("python3")
            .args(["-c", script])
            .arg(Path::new(env!("CARGO_MANIFEST_DIR")).join("../../scripts"))
            .arg(&base)
            .output()
            .unwrap();
        assert!(python.status.success());
        assert_eq!(String::from_utf8_lossy(&python.stdout).trim(), "True");
        assert_eq!(
            confirm_shopify_at(&Client::new(), &base),
            Confirmation::Confirmed
        );
        assert_eq!(server.join().unwrap().len(), 2);
    }
}
