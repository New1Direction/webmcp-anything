use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::{io, process::ExitCode};

#[derive(Deserialize)]
struct Fingerprint {
    name: String,
    sha256: String,
}

#[derive(Deserialize)]
struct Comparison {
    baseline: Vec<Fingerprint>,
    current: Vec<Fingerprint>,
}

#[derive(Default, Serialize)]
struct Diff<'a> {
    added: Vec<&'a str>,
    removed: Vec<&'a str>,
    changed: Vec<&'a str>,
}

fn index(tools: &[Fingerprint]) -> Result<HashMap<&str, &str>, &'static str> {
    let mut by_name = HashMap::with_capacity(tools.len());
    for tool in tools {
        if by_name
            .insert(tool.name.as_str(), tool.sha256.as_str())
            .is_some()
        {
            return Err("duplicate tool name");
        }
    }
    Ok(by_name)
}

fn compare(input: &Comparison) -> Result<Diff<'_>, &'static str> {
    let baseline = index(&input.baseline)?;
    let current = index(&input.current)?;
    let mut diff = Diff::default();
    for (&name, hash) in &current {
        match baseline.get(name) {
            None => diff.added.push(name),
            Some(previous) if previous != hash => diff.changed.push(name),
            Some(_) => {}
        }
    }
    diff.removed.extend(
        baseline
            .keys()
            .copied()
            .filter(|name| !current.contains_key(name)),
    );
    // Match the JavaScript Doctor's Array.sort order for non-ASCII names.
    for names in [&mut diff.added, &mut diff.removed, &mut diff.changed] {
        names.sort_unstable_by(|a, b| a.encode_utf16().cmp(b.encode_utf16()));
    }
    Ok(diff)
}

fn run() -> Result<(), Box<dyn std::error::Error>> {
    let input: Comparison = serde_json::from_reader(io::stdin().lock())?;
    let diff = compare(&input)?;
    serde_json::to_writer(io::stdout().lock(), &diff)?;
    Ok(())
}

fn main() -> ExitCode {
    match run() {
        Ok(()) => ExitCode::SUCCESS,
        Err(error) => {
            eprintln!("wmcp-doctor-diff: {error}");
            ExitCode::FAILURE
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn snapshot(hash: &str) -> Vec<Fingerprint> {
        if hash == "-" {
            return Vec::new();
        }
        vec![Fingerprint {
            name: "task".to_owned(),
            sha256: hash.to_owned(),
        }]
    }

    #[test]
    fn matches_lean_classifications() {
        for line in include_str!("../../formal/classifications.tsv").lines() {
            let mut fields = line.split('\t');
            let input = Comparison {
                baseline: snapshot(fields.next().unwrap()),
                current: snapshot(fields.next().unwrap()),
            };
            let diff = compare(&input).unwrap();
            let expected = fields.next().unwrap();
            let tool = ["task"];
            assert_eq!(
                diff.added,
                if expected == "added" { &tool[..] } else { &[] }
            );
            assert_eq!(
                diff.removed,
                if expected == "removed" {
                    &tool[..]
                } else {
                    &[]
                }
            );
            assert_eq!(
                diff.changed,
                if expected == "changed" {
                    &tool[..]
                } else {
                    &[]
                }
            );
        }
    }
}
