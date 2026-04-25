import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CatalogIngredient,
  Recipe,
  SalesRecord,
  formatVND,
  recipeBaseCost,
} from "@/lib/recipes";
import { toast } from "@/hooks/use-toast";
import { Coins, Receipt, Trash, TrendUp } from "@phosphor-icons/react";

interface Props {
  recipes: Recipe[];
  catalog: Record<string, CatalogIngredient>;
  sales: SalesRecord[];
  onAdd: (s: SalesRecord) => void;
  onDelete: (id: string) => void;
}

export const SalesTracker = ({ recipes, catalog, sales, onAdd, onDelete }: Props) => {
  const [recipeId, setRecipeId] = useState<string>(recipes[0]?.id ?? "");
  const [qty, setQty] = useState<string>("");
  const [revenue, setRevenue] = useState<string>("");
  const [period, setPeriod] = useState<"Week" | "Month">("Week");

  const recipeMap = useMemo(
    () => Object.fromEntries(recipes.map((r) => [r.id, r])),
    [recipes]
  );

  const kpis = useMemo(() => {
    let revenue = 0;
    let cogs = 0;
    sales.forEach((s) => {
      const r = recipeMap[s.recipeId];
      if (!r) return;
      revenue += s.revenueReceived;
      const unitCost = (recipeBaseCost(r, catalog) + r.overhead) / r.baseYield;
      cogs += unitCost * s.quantitySold;
    });
    return { revenue, cogs, profit: revenue - cogs };
  }, [sales, recipeMap, catalog]);

  const chartData = useMemo(() => {
    const map = new Map<string, { name: string; Revenue: number; Profit: number }>();
    sales.forEach((s) => {
      const r = recipeMap[s.recipeId];
      if (!r) return;
      const unitCost = (recipeBaseCost(r, catalog) + r.overhead) / r.baseYield;
      const cogs = unitCost * s.quantitySold;
      const existing = map.get(r.id) ?? {
        name: r.name.replace(/\s*\(.*\)/, ""),
        Revenue: 0,
        Profit: 0,
      };
      existing.Revenue += s.revenueReceived;
      existing.Profit += s.revenueReceived - cogs;
      map.set(r.id, existing);
    });
    return Array.from(map.values());
  }, [sales, recipeMap, catalog]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = Number(qty);
    const r = Number(revenue);
    if (!recipeId || !q || q <= 0 || !r || r < 0) {
      toast({
        title: "Invalid entry",
        description: "Please fill quantity and revenue with positive numbers.",
        variant: "destructive",
      });
      return;
    }
    onAdd({
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      recipeId,
      quantitySold: q,
      revenueReceived: r,
      period,
    });
    setQty("");
    setRevenue("");
    toast({ title: "Sale logged", description: "Your books are up to date." });
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard
          icon={<Receipt className="h-4 w-4" />}
          label="Total Revenue"
          value={formatVND(kpis.revenue)}
          tone="amber"
        />
        <KpiCard
          icon={<Coins className="h-4 w-4" />}
          label="Estimated COGS"
          value={formatVND(kpis.cogs)}
          tone="slate"
        />
        <KpiCard
          icon={<TrendUp className="h-4 w-4" />}
          label="Actual Net Profit"
          value={formatVND(kpis.profit)}
          tone="emerald"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        {/* Form */}
        <Card className="border-border/60 shadow-card h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Log a Sale</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sale-recipe">Recipe</Label>
                <Select value={recipeId} onValueChange={setRecipeId}>
                  <SelectTrigger id="sale-recipe">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {recipes.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sale-qty">Items Sold</Label>
                <Input
                  id="sale-qty"
                  type="number"
                  min="1"
                  placeholder="e.g. 12"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sale-rev">Total Revenue (VND)</Label>
                <Input
                  id="sale-rev"
                  type="number"
                  min="0"
                  placeholder="e.g. 450000"
                  value={revenue}
                  onChange={(e) => setRevenue(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sale-period">Time Period</Label>
                <Select
                  value={period}
                  onValueChange={(v) => setPeriod(v as "Week" | "Month")}
                >
                  <SelectTrigger id="sale-period">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Week">Current Week</SelectItem>
                    <SelectItem value="Month">Current Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">
                Log Sale
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Chart + table */}
        <div className="space-y-6">
          <Card className="border-border/60 shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Revenue vs. Profit by Recipe</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              {chartData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  Log your first sale to see the chart.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                      tickLine={false}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                    />
                    <YAxis
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                      tickLine={false}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      formatter={(v: number) => formatVND(v)}
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                        color: "hsl(var(--popover-foreground))",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="Revenue" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="Profit" fill="hsl(var(--profit))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Recent Sales</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Recipe</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                        No sales logged yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    [...sales]
                      .sort((a, b) => b.date.localeCompare(a.date))
                      .map((s) => (
                        <TableRow key={s.id} className="transition-colors hover:bg-accent/40">
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(s.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-sm font-medium">
                            {recipeMap[s.recipeId]?.name ?? "—"}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">{s.quantitySold}</TableCell>
                          <TableCell className="text-right tabular-nums font-medium">
                            {formatVND(s.revenueReceived)}
                          </TableCell>
                          <TableCell>
                            <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
                              {s.period}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onDelete(s.id)}
                              aria-label="Delete sale"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const KpiCard = ({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "amber" | "slate" | "emerald";
}) => {
  const styles = {
    amber: "bg-gradient-amber text-primary-foreground",
    slate: "bg-gradient-slate text-neutral-foreground",
    emerald: "bg-gradient-emerald text-profit-foreground",
  }[tone];
  return (
    <Card className="overflow-hidden border-border/60 shadow-card">
      <div className={`${styles} px-5 py-5`}>
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider opacity-90">
          {icon}
          {label}
        </div>
        <div className="mt-1.5 text-3xl font-bold tabular-nums">{value}</div>
      </div>
    </Card>
  );
};