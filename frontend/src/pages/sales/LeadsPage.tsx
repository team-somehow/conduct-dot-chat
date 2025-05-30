import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Search, Copy, Check, ArrowRight, LoaderCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Mock data for leads
const mockLeads = [
  {
    id: 1,
    name: "Acme Corp",
    domain: "acmecorp.com",
    email: "contact@acmecorp.com",
    phone: "+1 (555) 123-4567",
  },
  {
    id: 2,
    name: "TechStart Inc",
    domain: "techstart.io",
    email: "info@techstart.io",
    phone: "+1 (555) 222-3333",
  },
  {
    id: 3,
    name: "Global Systems",
    domain: "globalsystems.net",
    email: "sales@globalsystems.net",
    phone: "+1 (555) 444-5555",
  },
  {
    id: 4,
    name: "Bright Future Ltd",
    domain: "brightfuture.co",
    email: "hello@brightfuture.co",
    phone: "+1 (555) 666-7777",
  },
  {
    id: 5,
    name: "Quantum Solutions",
    domain: "quantumsolutions.com",
    email: "inquiries@quantumsolutions.com",
    phone: "+1 (555) 888-9999",
  },
  {
    id: 6,
    name: "Nexus Innovations",
    domain: "nexusinnovate.com",
    email: "support@nexusinnovate.com",
    phone: "+1 (555) 111-2222",
  },
  {
    id: 7,
    name: "Emerald Enterprises",
    domain: "emeraldent.com",
    email: "business@emeraldent.com",
    phone: "+1 (555) 333-4444",
  },
  {
    id: 8,
    name: "Horizon Partners",
    domain: "horizonpartners.org",
    email: "partners@horizonpartners.org",
    phone: "+1 (555) 555-6666",
  },
  {
    id: 9,
    name: "Blue Ocean Ventures",
    domain: "blueocean.vc",
    email: "invest@blueocean.vc",
    phone: "+1 (555) 777-8888",
  },
  {
    id: 10,
    name: "Stellar Dynamics",
    domain: "stellardynamics.tech",
    email: "connect@stellardynamics.tech",
    phone: "+1 (555) 999-0000",
  },
];

interface Lead {
  id: number;
  name: string;
  domain: string;
  email: string;
  phone: string;
  copied?: boolean;
}

export function LeadsPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedCount, setCopiedCount] = useState(0);

  // Simulate fetching leads with a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setLeads(mockLeads.map((lead) => ({ ...lead, copied: false })));
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Handle search
  const filteredLeads = leads.filter(
    (lead) =>
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle copying to clipboard
  const copyToClipboard = (text: string, leadId: number) => {
    navigator.clipboard.writeText(text).then(
      () => {
        // Update the copied state for this lead
        setLeads(
          leads.map((lead) =>
            lead.id === leadId ? { ...lead, copied: true } : lead
          )
        );

        // Increment the copy count
        setCopiedCount((prev) => prev + 1);

        // Show toast notification
        toast.success("Copied to clipboard");

        // Reset the copied state after a delay
        setTimeout(() => {
          setLeads(
            leads.map((lead) =>
              lead.id === leadId ? { ...lead, copied: false } : lead
            )
          );
        }, 2000);
      },
      (err) => {
        console.error("Could not copy text: ", err);
        toast.error("Failed to copy to clipboard");
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Potential Leads
            </h1>
            <p className="text-lg text-muted-foreground mt-1">
              We've found these potential leads for your product.
            </p>
          </div>

          {copiedCount > 0 && (
            <Badge variant="outline" className="px-3 py-1 text-base">
              <Check className="h-4 w-4 text-primary mr-1" />
              <span>
                <span className="font-medium">{copiedCount}</span>/
                {leads.length} copied
              </span>
            </Badge>
          )}
        </div>
      </div>

      <Card className="p-6 mb-8">
        {/* Search input */}
        <div className="flex items-center mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by name, domain, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center py-16">
              <LoaderCircle className="h-8 w-8 text-primary animate-spin" />
              <span className="ml-3 text-lg">Fetching leads...</span>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 rounded-md bg-muted animate-pulse"
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-6 text-muted-foreground"
                    >
                      No leads found matching your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell>{lead.domain}</TableCell>
                      <TableCell>{lead.email}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(lead.email, lead.id)}
                          className="h-8 w-8"
                        >
                          {lead.copied ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => navigate("/sales/email")} className="gap-2">
          Continue <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
