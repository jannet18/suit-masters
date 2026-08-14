import { Card, CardContent, CardFooter, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";

export type CardListItem = {
  id: string | number;
  title: string;
  subtitle?: string;
  value: string;
  image?: string;
};

const CardList = ({ title, items }: { title: string; items: CardListItem[] }) => {
  return (
    <div className="">
      <h1 className="text-lg font-medium mb-6">{title}</h1>
      <div className="flex flex-col gap-2">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No data yet.</p>
        ) : (
          items.map((item) => (
            <Card
              key={item.id}
              className="flex-row items-center justify-between gap-4 p-4"
            >
              <div className="w-12 h-12 rounded-sm relative overflow-hidden shrink-0 bg-muted">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <CardContent className="flex-1 p-0">
                <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                {item.subtitle && <Badge variant="secondary">{item.subtitle}</Badge>}
              </CardContent>
              <CardFooter className="p-0">{item.value}</CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default CardList;
