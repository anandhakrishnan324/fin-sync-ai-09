import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Calculator } from "lucide-react";

const TaxCalculator = () => {
  const [income, setIncome] = useState("");
  const [tax, setTax] = useState<number | null>(null);
  const [slab, setSlab] = useState("");
  const [itrForm, setItrForm] = useState("");

  const calculateTax = (annualIncome: number) => {
    let calculatedTax = 0;
    let taxSlab = "";
    let suggestedITR = "";

    // New Tax Regime FY 2024-25 (India)
    if (annualIncome <= 300000) {
      calculatedTax = 0;
      taxSlab = "₹0 - ₹3,00,000";
      suggestedITR = "ITR-1 (Sahaj)";
    } else if (annualIncome <= 700000) {
      calculatedTax = (annualIncome - 300000) * 0.05;
      taxSlab = "₹3,00,001 - ₹7,00,000";
      suggestedITR = "ITR-1 (Sahaj)";
    } else if (annualIncome <= 1000000) {
      calculatedTax = 20000 + (annualIncome - 700000) * 0.10;
      taxSlab = "₹7,00,001 - ₹10,00,000";
      suggestedITR = "ITR-1 (Sahaj) or ITR-2";
    } else if (annualIncome <= 1200000) {
      calculatedTax = 50000 + (annualIncome - 1000000) * 0.15;
      taxSlab = "₹10,00,001 - ₹12,00,000";
      suggestedITR = "ITR-2";
    } else if (annualIncome <= 1500000) {
      calculatedTax = 80000 + (annualIncome - 1200000) * 0.20;
      taxSlab = "₹12,00,001 - ₹15,00,000";
      suggestedITR = "ITR-2";
    } else {
      calculatedTax = 140000 + (annualIncome - 1500000) * 0.30;
      taxSlab = "Above ₹15,00,000";
      suggestedITR = "ITR-2 or ITR-3";
    }

    // Add 4% cess
    calculatedTax = calculatedTax * 1.04;

    setTax(calculatedTax);
    setSlab(taxSlab);
    setItrForm(suggestedITR);
  };

  const handleCalculate = () => {
    const annualIncome = parseFloat(income);
    if (isNaN(annualIncome) || annualIncome < 0) {
      setTax(null);
      return;
    }
    calculateTax(annualIncome);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Calculator className="w-8 h-8" />
          Indian Income Tax Calculator
        </h1>
        <p className="text-muted-foreground">
          Calculate your tax liability under New Tax Regime FY 2024-25
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Disclaimer:</strong> This is a simplified estimate for informational purposes only. 
          The calculation uses the New Indian Tax Regime for FY 2024-25. 
          Please consult a qualified Chartered Accountant or tax professional for accurate tax planning and filing.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Enter Your Annual Income</CardTitle>
          <CardDescription>Input your estimated annual income in Indian Rupees</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="income">Annual Income (₹)</Label>
            <Input
              id="income"
              type="number"
              placeholder="500000"
              value={income}
              onChange={(e) => {
                setIncome(e.target.value);
                handleCalculate();
              }}
              min="0"
            />
          </div>

          {tax !== null && (
            <div className="space-y-4 pt-4 border-t">
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Estimated Tax Liability
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">
                      ₹{tax.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-accent/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Take Home (Post-Tax)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      ₹{(parseFloat(income) - tax).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-3 p-4 bg-muted rounded-lg">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Tax Slab:</span>
                  <p className="text-lg font-semibold">{slab}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Suggested ITR Form:</span>
                  <p className="text-lg font-semibold">{itrForm}</p>
                </div>
                <div className="text-xs text-muted-foreground pt-2 border-t">
                  * Tax includes 4% Health & Education Cess
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>New Tax Regime Slabs (FY 2024-25)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-2 p-2 bg-muted rounded">
              <span className="font-medium">Income Range</span>
              <span className="font-medium">Tax Rate</span>
            </div>
            <div className="grid grid-cols-2 gap-2 p-2">
              <span>₹0 - ₹3,00,000</span>
              <span className="text-green-600 font-medium">Nil</span>
            </div>
            <div className="grid grid-cols-2 gap-2 p-2 bg-muted/50 rounded">
              <span>₹3,00,001 - ₹7,00,000</span>
              <span>5%</span>
            </div>
            <div className="grid grid-cols-2 gap-2 p-2">
              <span>₹7,00,001 - ₹10,00,000</span>
              <span>10%</span>
            </div>
            <div className="grid grid-cols-2 gap-2 p-2 bg-muted/50 rounded">
              <span>₹10,00,001 - ₹12,00,000</span>
              <span>15%</span>
            </div>
            <div className="grid grid-cols-2 gap-2 p-2">
              <span>₹12,00,001 - ₹15,00,000</span>
              <span>20%</span>
            </div>
            <div className="grid grid-cols-2 gap-2 p-2 bg-muted/50 rounded">
              <span>Above ₹15,00,000</span>
              <span>30%</span>
            </div>
            <div className="text-xs text-muted-foreground pt-2 border-t">
              + 4% Health & Education Cess on total tax
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaxCalculator;
