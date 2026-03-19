import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  name: string;
  image: string;
  price: number;
  tag?: string;
}

const ProductCard = ({ name, image, price, tag }: ProductCardProps) => (
  <Link to="/product" className="group block">
    <div className="overflow-hidden rounded-lg bg-card border transition-shadow hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img src={image} alt={name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        {tag && (
          <span className="absolute top-3 left-3 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
            {tag}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-heading text-sm">{name}</h3>
        <p className="mt-1 font-body text-muted-foreground">From ₹{price}</p>
        <Button className="mt-3 w-full bg-primary text-primary-foreground hover:bg-primary/90" size="sm">
          View Product
        </Button>
      </div>
    </div>
  </Link>
);

export default ProductCard;
