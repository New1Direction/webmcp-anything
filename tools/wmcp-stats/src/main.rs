use serde_json::{json, Value};
use std::io::{self, Read};

fn log_add(a: f64, b: f64) -> f64 {
    let high = a.max(b);
    high + (a.min(b) - high).exp().ln_1p()
}
fn binomial_tail(trials: usize, successes: usize, probability: f64) -> f64 {
    if successes == 0 {
        return 1.0;
    }
    if successes > trials || probability == 0.0 {
        return 0.0;
    }
    if probability == 1.0 {
        return 1.0;
    }
    let p = probability.ln();
    let q = (-probability).ln_1p();
    let mut choose = 0.0;
    for i in 1..=successes.min(trials - successes) {
        choose += ((trials + 1 - i) as f64).ln() - (i as f64).ln();
    }
    let mut term = choose + successes as f64 * p + (trials - successes) as f64 * q;
    let mut tail = term;
    for i in successes..trials {
        term += ((trials - i) as f64).ln() - ((i + 1) as f64).ln() + p - q;
        tail = log_add(tail, term);
    }
    tail.exp().min(1.0)
}
fn lower_rate(successes: usize, trials: usize, alpha: f64) -> Value {
    if trials == 0 {
        return json!({"successes": successes, "trials": trials, "estimate": null, "lower": null});
    }
    let (mut lower, mut upper) = (0.0, 1.0);
    if successes > 0 {
        for _ in 0..48 {
            let mid = (lower + upper) / 2.0;
            if binomial_tail(trials, successes, mid) <= alpha {
                lower = mid;
            } else {
                upper = mid;
            }
        }
    }
    json!({"successes":successes, "trials":trials, "estimate":successes as f64 / trials as f64, "lower":lower})
}
fn upper_p95(latencies: &[Option<f64>], alpha: f64) -> Value {
    let mut ordered: Vec<f64> = latencies
        .iter()
        .map(|v| v.unwrap_or(f64::INFINITY))
        .collect();
    ordered.sort_by(f64::total_cmp);
    let count = ordered.len();
    let represent = |v: Option<f64>| v.filter(|n| n.is_finite());
    let estimate = if count == 0 {
        None
    } else {
        represent(Some(ordered[((0.95 * count as f64).ceil() as usize) - 1]))
    };
    if count == 0 || binomial_tail(count, count, 0.95) > alpha {
        return json!({"estimateMs":estimate,"upperMs":null,"rank":null,"status":"insufficient-sample"});
    }
    let (mut first, mut last) = (1, count);
    while first < last {
        let mid = (first + last) / 2;
        if binomial_tail(count, mid, 0.95) <= alpha {
            last = mid;
        } else {
            first = mid + 1;
        }
    }
    let upper = represent(Some(ordered[first - 1]));
    json!({"estimateMs":estimate,"upperMs":upper,"rank":first,"status":if upper.is_some() { "bounded" } else { "unbounded" }})
}
fn integer(v: &Value, key: &str) -> Result<usize, String> {
    v[key]
        .as_u64()
        .and_then(|x| usize::try_from(x).ok())
        .filter(|x| *x <= 1_000_000)
        .ok_or_else(|| format!("invalid {key}"))
}
fn alpha(v: &Value) -> Result<f64, String> {
    v["alpha"]
        .as_f64()
        .filter(|a| *a > 0.0 && *a < 1.0)
        .ok_or("invalid alpha".into())
}
fn latencies(v: &Value) -> Result<Vec<Option<f64>>, String> {
    v["latencies"]
        .as_array()
        .ok_or("latencies must be an array")?
        .iter()
        .map(|v| {
            if v.is_null() {
                Ok(None)
            } else {
                v.as_f64()
                    .filter(|x| x.is_finite() && *x >= 0.0)
                    .map(Some)
                    .ok_or("invalid latency".into())
            }
        })
        .collect()
}
fn metrics(
    n: usize,
    completed: usize,
    correct: usize,
    suitable: Option<usize>,
    times: &[Option<f64>],
    alpha: f64,
) -> Value {
    json!({"attempts":n,"correctness":lower_rate(correct,n,alpha),"reliability":lower_rate(completed,n,alpha),"suitability":suitable.map(|s| lower_rate(s,n,alpha)),"latency":upper_p95(times,alpha)})
}
fn calculate(v: &Value) -> Result<Value, String> {
    let a = alpha(v)?;
    match v["op"].as_str() {
        Some("rate") => {
            let s = integer(v, "successes")?;
            let n = integer(v, "trials")?;
            if s > n {
                return Err("successes exceed trials".into());
            }
            Ok(lower_rate(s, n, a))
        }
        Some("p95") => Ok(upper_p95(&latencies(v)?, a)),
        Some("measure") => {
            let n = integer(v, "attempts")?;
            let correct = integer(v, "correct")?;
            let completed = integer(v, "completed")?;
            let suitable = if v["suitable"].is_null() {
                None
            } else {
                Some(integer(v, "suitable")?)
            };
            let times = latencies(v)?;
            if times.len() != n
                || correct > completed
                || completed > n
                || suitable.is_some_and(|s| s > correct)
            {
                return Err("inconsistent trial counts".into());
            }
            Ok(metrics(n, completed, correct, suitable, &times, a))
        }
        Some("trials") => {
            let trials = v["trials"].as_array().ok_or("trials must be an array")?;
            let required = v["required"]
                .as_array()
                .ok_or("required must be an array")?;
            let preferred = v["preferred"]
                .as_array()
                .ok_or("preferred must be an array")?;
            if trials.len() > 1_000_000
                || required
                    .iter()
                    .chain(preferred)
                    .any(|item| !item.is_string())
            {
                return Err("invalid trials or checks".into());
            }
            let mut completed = 0;
            let mut correct = 0;
            let mut suitable = 0;
            let mut times = Vec::with_capacity(trials.len());
            for trial in trials {
                match trial["status"].as_str() {
                    Some("completed") => {
                        completed += 1;
                        let latency = trial["latencyMs"]
                            .as_f64()
                            .filter(|n| n.is_finite() && *n >= 0.0)
                            .ok_or("invalid latency")?;
                        times.push(Some(latency));
                        let checks = trial["checks"].as_object().ok_or("missing checks")?;
                        let passed = |names: &[Value]| {
                            names.iter().all(|name| {
                                checks.get(name.as_str().unwrap()).and_then(Value::as_bool)
                                    == Some(true)
                            })
                        };
                        if passed(required) {
                            correct += 1;
                            if passed(preferred) {
                                suitable += 1;
                            }
                        }
                    }
                    Some("failed" | "timeout") => times.push(None),
                    _ => return Err("invalid trial status".into()),
                }
            }
            Ok(metrics(
                trials.len(),
                completed,
                correct,
                (!preferred.is_empty()).then_some(suitable),
                &times,
                a,
            ))
        }
        _ => Err("unknown operation".into()),
    }
}
fn process(input: &Value) -> Result<Value, String> {
    let requests = input["requests"]
        .as_array()
        .ok_or("requests must be an array")?;
    requests
        .iter()
        .map(calculate)
        .collect::<Result<Vec<_>, _>>()
        .map(Value::Array)
}
fn main() {
    let result = (|| -> Result<Value, String> {
        let mut data = String::new();
        io::stdin()
            .read_to_string(&mut data)
            .map_err(|e| e.to_string())?;
        let input: Value = serde_json::from_str(&data).map_err(|e| e.to_string())?;
        process(&input)
    })();
    match result {
        Ok(value) => println!("{value}"),
        Err(error) => {
            eprintln!("{error}");
            std::process::exit(1);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn matches_javascript_reference_cases() {
        let cases: Value = serde_json::from_str(include_str!("../tests/reference.json")).unwrap();
        for case in cases["rates"].as_array().unwrap() {
            let got = lower_rate(
                case["successes"].as_u64().unwrap() as usize,
                case["trials"].as_u64().unwrap() as usize,
                case["alpha"].as_f64().unwrap(),
            );
            assert_eq!(got["successes"], case["expected"]["successes"]);
            assert_eq!(got["trials"], case["expected"]["trials"]);
            for key in ["estimate", "lower"] {
                match (got[key].as_f64(), case["expected"][key].as_f64()) {
                    (Some(a), Some(b)) => assert!((a - b).abs() < 1e-12, "{case}"),
                    (None, None) => {}
                    _ => panic!("{case}"),
                }
            }
        }
        for case in cases["latency"].as_array().unwrap() {
            let got = upper_p95(&latencies(case).unwrap(), case["alpha"].as_f64().unwrap());
            let expected = &case["expected"];
            assert_eq!(got["status"], expected["status"]);
            assert_eq!(got["rank"], expected["rank"]);
            for key in ["estimateMs", "upperMs"] {
                assert_eq!(got[key].as_f64(), expected[key].as_f64());
            }
        }
    }
    #[test]
    fn rejects_inconsistent_counts() {
        assert!(calculate(&json!({"op":"measure","alpha":0.05,"attempts":1,"correct":2,"completed":1,"latencies":[1]})).is_err());
    }

    #[test]
    fn count_validation_matches_lean_cases() {
        for line in include_str!("../formal/counts.tsv").lines() {
            let fields: Vec<_> = line.split('\t').collect();
            let attempts: usize = fields[0].parse().unwrap();
            let completed: usize = fields[1].parse().unwrap();
            let correct: usize = fields[2].parse().unwrap();
            let input = json!({"op":"measure","alpha":0.05,"attempts":attempts,
                "completed":completed,"correct":correct,"suitable":null,"latencies":vec![Some(1.0); attempts]});
            assert_eq!(calculate(&input).is_ok(), fields[3] == "allow", "{line}");
        }
    }

    #[test]
    fn trials_count_only_completed_required_and_preferred_checks() {
        let input = json!({"op":"trials", "alpha":0.05,
        "required":["correct"], "preferred":["fast"],
        "trials":[
            {"status":"completed","latencyMs":10,"checks":{"correct":true,"fast":true}},
            {"status":"completed","latencyMs":20,"checks":{"correct":true,"fast":false}},
            {"status":"completed","latencyMs":30,"checks":{"correct":false,"fast":true}},
            {"status":"timeout","latencyMs":40}
        ]});
        let result = calculate(&input).unwrap();
        assert_eq!(result["attempts"], 4);
        assert_eq!(result["reliability"]["successes"], 3);
        assert_eq!(result["correctness"]["successes"], 2);
        assert_eq!(result["suitability"]["successes"], 1);
        assert_eq!(result["latency"]["status"], "insufficient-sample");
    }
}
