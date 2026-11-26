use clap::{Parser, Subcommand};
use reqwest::blocking::Client;
use serde_json::Value;
use std::collections::BTreeMap;
use std::io::{self, IsTerminal, Read};
use std::process::ExitCode;
use std::time::Duration;

mod admin;

const CATEGORIES: &[(&str, &[&str])] = &[
    (
        "shopify-shoes",
        &[
            "https://www.allbirds.com/products/mens-wool-runners",
            "https://www.allbirds.com/products/womens-tree-runners",
            "https://www.allbirds.com/products/mens-tree-runners",
            "https://www.allbirds.com/products/womens-wool-runner-mizzles",
        ],
    ),
    (
        "shopify-apparel",
        &[
            "https://www.everlane.com/products/mens-organic-cotton-crew-tee-white",
            "https://www.everlane.com/products/womens-organic-cotton-box-cut-tee-white",
            "https://www.tenthousand.cc/products/interval-short",
            "https://outdoorvoices.com/products/exercise-dress",
        ],
    ),
    (
        "shopify-cpg",
        &[
            "https://www.deathwishcoffee.com/products/death-wish-ground-coffee-can",
            "https://liquiddeath.com/products/liquid-death-mountain-water-12-pack",
            "https://magicspoon.com/products/magic-spoon-cereal-variety-pack",
            "https://www.partakefoods.com/products/birthday-cake-cookies",
        ],
    ),
    (
        "shopify-beauty",
        &[
            "https://www.glossier.com/products/balm-dotcom",
            "https://www.huel.com/products/huel-black-edition",
            "https://www.brooklinen.com/products/classic-core-sheet-set",
        ],
    ),
    (
        "openapi-public",
        &[
            "https://petstore3.swagger.io/api/v3/openapi.json",
            "https://petstore.swagger.io/v2/swagger.json",
            "https://api.frankfurter.app/openapi.json",
        ],
    ),
];

#[derive(Parser)]
#[command(about = "Operator tools for wmcp.sh")]
struct Cli {
    #[command(subcommand)]
    command: Command,
}

#[derive(Subcommand)]
enum Command {
    /// Populate the directory by requesting tools for URLs.
    Seed {
        #[arg(long)]
        category: Vec<String>,
        #[arg(long, default_value_t = 1.0)]
        rate: f64,
        #[arg(long)]
        fresh: bool,
        #[arg(long)]
        list_categories: bool,
        #[arg(long, default_value = "https://wmcp.sh")]
        base_url: String,
    },
    /// Harvest remote MCP servers from the registry and submit them for grading.
    Crawl(admin::CrawlArgs),
    /// Submit a JSON array of MCP server URLs for grading.
    Submit(admin::SubmitArgs),
    /// Confirm Shopify candidates and optionally submit them.
    ShopifyCoverage(admin::ShopifyArgs),
    /// Review or retry a failed-submission recovery file.
    Resume(admin::ResumeArgs),
}

struct ResultRow {
    status: u16,
    adapter: String,
    tool_count: usize,
    error: String,
}

fn hit(client: &Client, base: &str, url: &str, fresh: bool) -> ResultRow {
    let mut request = client
        .get(format!("{}/api/v1/tools", base.trim_end_matches('/')))
        .query(&[("url", url)]);
    if fresh {
        request = request.query(&[("fresh", "1")]);
    }
    let result = (|| -> Result<ResultRow, Box<dyn std::error::Error>> {
        let response = request.send()?;
        let status = response.status().as_u16();
        let body = response.bytes()?;
        if !(200..300).contains(&status) {
            return Ok(ResultRow {
                status,
                adapter: String::new(),
                tool_count: 0,
                error: String::from_utf8_lossy(&body).chars().take(200).collect(),
            });
        }
        let data: Value = if body.is_empty() {
            serde_json::json!({})
        } else {
            serde_json::from_slice(&body)?
        };
        Ok(ResultRow {
            status,
            adapter: data
                .get("adapter")
                .and_then(Value::as_str)
                .unwrap_or("")
                .to_owned(),
            tool_count: data
                .get("tools")
                .and_then(Value::as_array)
                .map_or(0, Vec::len),
            error: String::new(),
        })
    })();
    result.unwrap_or_else(|error| ResultRow {
        status: 0,
        adapter: String::new(),
        tool_count: 0,
        error: error.to_string().chars().take(200).collect(),
    })
}

fn main() -> ExitCode {
    let (category, rate, fresh, list_categories, base_url) = match Cli::parse().command {
        Command::Crawl(args) => return admin::run(admin::crawl(args)),
        Command::Submit(args) => return admin::run(admin::submit(args)),
        Command::ShopifyCoverage(args) => return admin::run(admin::shopify(args)),
        Command::Resume(args) => return admin::run(admin::resume(args)),
        Command::Seed {
            category,
            rate,
            fresh,
            list_categories,
            base_url,
        } => (category, rate, fresh, list_categories, base_url),
    };
    if list_categories {
        for (name, urls) in CATEGORIES {
            println!("  {name:24} {} urls", urls.len());
        }
        return ExitCode::SUCCESS;
    }
    if !rate.is_finite() {
        eprintln!("rate must be finite");
        return ExitCode::from(2);
    }
    let mut urls = Vec::new();
    for name in category {
        match CATEGORIES.iter().find(|(category, _)| *category == name) {
            Some((_, values)) => urls.extend(values.iter().map(|s| s.to_string())),
            None => {
                eprintln!("unknown category: {name}");
                return ExitCode::from(2);
            }
        }
    }
    if !io::stdin().is_terminal() {
        let mut input = String::new();
        if let Err(error) = io::stdin().read_to_string(&mut input) {
            eprintln!("cannot read stdin: {error}");
            return ExitCode::from(1);
        }
        urls.extend(input.lines().map(str::to_owned));
    }
    if urls.is_empty() {
        urls.extend(
            CATEGORIES
                .iter()
                .flat_map(|(_, values)| values.iter().map(|s| s.to_string())),
        );
        println!(
            "# no input; seeding all {} curated URLs across {} categories\n",
            urls.len(),
            CATEGORIES.len()
        );
    }
    let client = Client::builder()
        .timeout(Duration::from_secs(20))
        .user_agent("wmcp-seed/0.1")
        .default_headers(
            [(reqwest::header::ACCEPT, "application/json".parse().unwrap())]
                .into_iter()
                .collect(),
        )
        .build()
        .expect("failed to build HTTP client");
    let mut ok = 0;
    let mut total = 0;
    let mut adapters = BTreeMap::<String, usize>::new();
    for url in urls
        .iter()
        .map(|s| s.trim())
        .filter(|s| !s.is_empty() && !s.starts_with('#'))
    {
        let result = hit(&client, &base_url, url, fresh);
        total += 1;
        let success = result.status == 200;
        if success {
            ok += 1;
            if !result.adapter.is_empty() {
                *adapters.entry(result.adapter.clone()).or_default() += 1;
            }
        }
        print!("  {} [{}] ", if success { '✓' } else { '✗' }, result.status);
        if success && !result.adapter.is_empty() {
            print!("{:<8} {:>3} tools  ", result.adapter, result.tool_count);
        }
        print!("{url}");
        if !result.error.is_empty() {
            print!("  — {}", result.error.chars().take(80).collect::<String>());
        }
        println!();
        std::thread::sleep(Duration::from_secs_f64(1.0 / rate.max(0.1)));
    }
    println!("\n# {ok}/{total} OK · {} failed", total - ok);
    if !adapters.is_empty() {
        println!(
            "# by adapter: {}",
            adapters
                .iter()
                .map(|(name, count)| format!("{name}={count}"))
                .collect::<Vec<_>>()
                .join(", ")
        );
    }
    if total == ok {
        ExitCode::SUCCESS
    } else {
        ExitCode::from(1)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::{Read, Write};
    use std::net::TcpListener;

    fn serve(status: &str, body: &str) -> (String, std::thread::JoinHandle<String>) {
        let listener = TcpListener::bind("127.0.0.1:0").unwrap();
        let base = format!("http://{}", listener.local_addr().unwrap());
        let response = format!(
            "HTTP/1.1 {status}\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{body}",
            body.len()
        );
        let handle = std::thread::spawn(move || {
            let (mut stream, _) = listener.accept().unwrap();
            let mut buf = [0; 4096];
            let n = stream.read(&mut buf).unwrap();
            stream.write_all(response.as_bytes()).unwrap();
            String::from_utf8_lossy(&buf[..n]).into_owned()
        });
        (base, handle)
    }

    #[test]
    fn sends_encoded_url_and_fresh_and_parses_tools() {
        let (base, server) = serve("200 OK", r#"{"adapter":"shopify","tools":[{},{}]}"#);
        let row = hit(&Client::new(), &base, "https://example.com/?a=1&b=2", true);
        assert_eq!(
            (row.status, row.adapter.as_str(), row.tool_count),
            (200, "shopify", 2)
        );
        let request = server.join().unwrap();
        assert!(request.contains("url=https%3A%2F%2Fexample.com%2F%3Fa%3D1%26b%3D2"));
        assert!(request.contains("fresh=1"));
    }

    #[test]
    fn preserves_http_error_and_handles_invalid_json() {
        let (base, server) = serve("429 Too Many Requests", "slow down");
        let row = hit(&Client::new(), &base, "https://example.com", false);
        assert_eq!((row.status, row.error.as_str()), (429, "slow down"));
        server.join().unwrap();
        let (base, server) = serve("200 OK", "bad json");
        let row = hit(&Client::new(), &base, "https://example.com", false);
        assert_eq!(row.status, 0);
        assert!(!row.error.is_empty());
        server.join().unwrap();
    }
}
