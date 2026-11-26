import Std

-- This model covers the decision boundaries, not the HTTP or filesystem code.
def safeConfirmation (checked unavailable confirmed : Nat) : Bool :=
  checked != 0 && confirmed != 0 && (unavailable == 0 || unavailable * 2 < checked)

def mayUseCrawl (complete allowPartial : Bool) : Bool := complete || allowPartial

def retryableStatus (status : Nat) : Bool := status == 429 || (500 ≤ status && status ≤ 599)

theorem empty_candidates_blocked (unavailable confirmed : Nat) :
    safeConfirmation 0 unavailable confirmed = false := by
  simp [safeConfirmation]

theorem no_confirmations_blocked (checked unavailable : Nat) :
    safeConfirmation checked unavailable 0 = false := by
  simp [safeConfirmation]

theorem widespread_unavailability_blocked (checked unavailable confirmed : Nat)
    (nonzero : unavailable ≠ 0) (half : checked ≤ unavailable * 2) :
    safeConfirmation checked unavailable confirmed = false := by
  simp [safeConfirmation, nonzero, Nat.not_lt.mpr half]

theorem incomplete_crawl_blocked_without_override :
    mayUseCrawl false false = false := by
  decide

theorem complete_crawl_permitted (override : Bool) :
    mayUseCrawl true override = true := by
  cases override <;> decide

theorem incomplete_crawl_requires_override (override : Bool) :
    mayUseCrawl false override = override := by
  cases override <;> decide

theorem unauthorized_is_not_retried : retryableStatus 401 = false := by decide
theorem rate_limit_is_retried : retryableStatus 429 = true := by decide
theorem server_errors_are_retried (status : Nat) (lower : 500 ≤ status) (upper : status ≤ 599) :
    retryableStatus status = true := by
  simp [retryableStatus, lower, upper]

def main (args : List String) : IO Unit := do
  if args.contains "retry" then
    for status in ([200, 400, 401, 408, 429, 499, 500, 503, 599, 600] : List Nat) do
      let outcome := if retryableStatus status then "retry" else "stop"
      IO.println (String.intercalate "\t" [toString status, outcome])
    return
  let cases : List (Nat × Nat × Nat) :=
    [(0, 0, 0), (1, 0, 0), (1, 0, 1), (2, 1, 1),
     (3, 1, 1), (4, 2, 1), (4, 1, 2), (4, 0, 4)]
  for (checked, unavailable, confirmed) in cases do
    let outcome := if safeConfirmation checked unavailable confirmed then "allow" else "block"
    IO.println (String.intercalate "\t" [toString checked, toString unavailable, toString confirmed, outcome])
