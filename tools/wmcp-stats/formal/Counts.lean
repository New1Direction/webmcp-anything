import Std

def validCounts (attempts completed correct : Nat) : Bool :=
  correct ≤ completed && completed ≤ attempts

theorem valid_counts_bound_correct (attempts completed correct : Nat)
    (valid : validCounts attempts completed correct = true) : correct ≤ attempts := by
  simp [validCounts] at valid
  exact Nat.le_trans valid.1 valid.2

theorem no_completion_means_no_correct (attempts correct : Nat)
    (valid : validCounts attempts 0 correct = true) : correct = 0 := by
  simp [validCounts] at valid
  omega

def main : IO Unit := do
  let cases : List (Nat × Nat × Nat) :=
    [(0, 0, 0), (1, 0, 0), (1, 1, 1), (1, 0, 1), (1, 2, 1), (3, 2, 1), (3, 2, 3)]
  for (attempts, completed, correct) in cases do
    let outcome := if validCounts attempts completed correct then "allow" else "block"
    IO.println (String.intercalate "\t" [toString attempts, toString completed, toString correct, outcome])
