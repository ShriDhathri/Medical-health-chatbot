import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { resources } from "@/lib/data";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { ArrowUpRight } from "lucide-react";

export default function ResourcesPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold font-headline mb-2">Resource Directory</h1>
      <p className="text-muted-foreground mb-8">
        Here are some valuable resources for mental health support and information.
      </p>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {resources.map((resource) => (
          <Card key={resource.id} className="flex flex-col">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        {resource.icon && <div className="p-3 bg-accent/50 rounded-lg"><resource.icon className="w-6 h-6 text-accent-foreground" /></div>}
                        <CardTitle className="text-lg">{resource.name}</CardTitle>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <CardDescription>{resource.description}</CardDescription>
            </CardContent>
            <div className="p-6 pt-0">
                <Button asChild variant="outline" className="w-full">
                  <Link href={resource.url} target="_blank" rel="noopener noreferrer">
                    Visit Site <ArrowUpRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
