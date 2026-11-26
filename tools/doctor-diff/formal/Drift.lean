inductive Drift where
  | unchanged | added | removed | changed
  deriving DecidableEq

def classify [DecidableEq α] (before after : Option α) : Drift :=
  match before, after with
  | none, none => .unchanged
  | none, some _ => .added
  | some _, none => .removed
  | some old, some new => if old = new then .unchanged else .changed

theorem unchanged_iff_equal [DecidableEq α] (before after : Option α) :
    classify before after = .unchanged ↔ before = after := by
  cases before with
  | none => cases after <;> simp [classify]
  | some old =>
    cases after with
    | none => simp [classify]
    | some new => by_cases same : old = new <;> simp [classify, same]

theorem changed_iff_different_hash [DecidableEq α] (old new : α) :
    classify (some old) (some new) = .changed ↔ old ≠ new := by
  by_cases same : old = new <;> simp [classify, same]

def Drift.label : Drift → String
  | .unchanged => "unchanged"
  | .added => "added"
  | .removed => "removed"
  | .changed => "changed"

def main : IO Unit := do
  let cases : List (Option Nat × Option Nat) :=
    [(none, none), (none, some 1), (some 1, none), (some 1, some 1), (some 1, some 2)]
  for (before, after) in cases do
    let label := fun value : Option Nat => value.map toString |>.getD "-"
    IO.println (String.intercalate "\t" [label before, label after, (classify before after).label])
