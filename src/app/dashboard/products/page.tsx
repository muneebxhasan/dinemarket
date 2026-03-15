import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ProductList from "./products";
export default function CustomersPage() {
  return (
    <div className="min-h-screen">
      <ProductList />
    </div>
  );
}
