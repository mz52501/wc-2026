export function RulesPage() {
  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-lg font-bold mb-1">How the league works</h1>
        <p className="text-sm text-muted-foreground">
          For every World Cup match, each player is paired against one opponent from the league.
          You both predict the score. Whoever predicted better wins the duel.
        </p>
      </div>

      <div>
        <h2 className="text-sm font-semibold mb-2">Duel points</h2>
        <div className="rounded-lg border border-border bg-card divide-y divide-border">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm">Your prediction was closer</span>
            <span className="text-sm font-bold text-green-600">+3 pts</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm">Both equally close</span>
            <span className="text-sm font-bold text-muted-foreground">+1 pt each</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm">Opponent's prediction was closer</span>
            <span className="text-sm font-bold text-destructive">+0 pts</span>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold mb-2">How "closer" is determined</h2>
        <p className="text-sm text-muted-foreground mb-3">
          Each prediction earns prediction points based on accuracy. Getting the exact score right
          earns more than just getting the outcome right. Your duel result comes down to who scored
          more prediction points on that match.
        </p>
        <div className="rounded-lg border border-border bg-card px-4 py-3 space-y-2">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Example</p>
          <p className="text-sm">Actual result: <span className="font-bold">1 - 0</span></p>
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <p className="text-xs text-muted-foreground mb-1">You predicted</p>
              <p className="text-sm font-bold">2 - 1</p>
              <p className="text-xs text-green-600 mt-0.5">Correct outcome (home win)</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Opponent predicted</p>
              <p className="text-sm font-bold">0 - 1</p>
              <p className="text-xs text-destructive mt-0.5">Wrong outcome (away win)</p>
            </div>
          </div>
          <p className="text-sm pt-1 border-t border-border">
            You win the duel <span className="font-bold text-green-600">+3 pts</span> — your
            opponent missed completely, you at least had the right winner.
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold mb-2">Predictions lock</h2>
        <p className="text-sm text-muted-foreground">
          Predictions lock 1 hour before each match kicks off. After lock you can see your
          opponent's prediction. Results and duel outcomes are settled once the final score is
          entered.
        </p>
      </div>

      <div>
        <h2 className="text-sm font-semibold mb-2">Bonus predictions</h2>
        <p className="text-sm text-muted-foreground mb-3">
          Before the tournament starts, every player picks the tournament winner, top scorer, and
          best player. Nobody sees each other's picks until the tournament begins.
        </p>
        <div className="rounded-lg border border-border bg-card divide-y divide-border">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm">Tournament winner</span>
            <span className="text-sm font-bold text-green-600">+15 pts</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm">Top scorer</span>
            <span className="text-sm font-bold text-green-600">+10 pts</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm">Best player</span>
            <span className="text-sm font-bold text-green-600">+5 pts</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Max 30 bonus points — roughly the same as winning 10 extra duels.
        </p>
      </div>

      <div>
        <h2 className="text-sm font-semibold mb-2">Tiebreakers</h2>
        <p className="text-sm text-muted-foreground mb-3">
          If two or more players are level on points, the following order decides their ranking.
        </p>
        <div className="rounded-lg border border-border bg-card divide-y divide-border">
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="text-xs font-bold text-muted-foreground w-4">1</span>
            <div>
              <p className="text-sm">Head-to-head record</p>
              <p className="text-xs text-muted-foreground">Points earned in duels between only the tied players</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="text-xs font-bold text-muted-foreground w-4">2</span>
            <span className="text-sm">Total wins</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="text-xs font-bold text-muted-foreground w-4">3</span>
            <span className="text-sm text-muted-foreground">Draw</span>
          </div>
        </div>
      </div>
    </div>
  )
}
