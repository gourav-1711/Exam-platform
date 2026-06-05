"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { CurrentAffairsFilters } from "@/components/admin/CurrentAffairsFilters";
import { CurrentAffairsTable } from "@/components/admin/CurrentAffairsTable";
import { CurrentAffairsPagination } from "@/components/admin/CurrentAffairsPagination";
import { Plus } from "lucide-react";
import Link from "next/link";
import { adminApi } from "@/lib/api/endpoints";
import type { CurrentAffair } from "@/lib/api";
import { queryKeys } from "@/lib/api/query-keys";
import { CurrentAffairsSearch } from "@/components/admin/CurrentAffairesSearch";

interface CurrentAffairsResponse {
  data: CurrentAffair[];
  total: number;
  page: number;
  totalPages: number;
}

const DEFAULT_CATEGORY = "All";

export default function CurrentAffairsAdminPage() {
  const { toast } = useToast();
  const { getToken } = useAuth();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(DEFAULT_CATEGORY);
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery<CurrentAffairsResponse>({
    queryKey: queryKeys.admin.currentAffairs.all(),
    enabled: true,
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      return adminApi.listCurrentAffairs(token, {
        page,
        limit: 10,
        search: search || undefined,
        category,
      });
    },
    staleTime: 60000,
  });

  const handleDelete = async (id: number) => {
    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      await adminApi.deleteCurrentAffair(token, id);
      toast({ title: "Current affair deleted successfully" });
    } catch {
      toast({
        title: "Failed to delete current affair",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Current Affairs</h1>
          <p className="text-gray-500 text-sm mt-1">
            {data?.total ?? 0} total articles
          </p>
        </div>
        <Button asChild className="bg-violet-600 hover:bg-violet-700">
          <Link href="/admin/current-affairs/new">
            <Plus className="h-4 w-4 mr-2" />
            New Article
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <CurrentAffairsSearch value={search} onChange={setSearch} />
        <CurrentAffairsFilters
          category={category}
          onCategoryChange={setCategory}
        />
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {isError ? (
            <div className="p-8 text-center text-red-500">
              Failed to load current affairs
            </div>
          ) : (
            <>
              <CurrentAffairsTable
                data={data?.data || []}
                onDelete={handleDelete}
                isLoading={isLoading}
              />
              {data && data.totalPages > 1 && (
                <CurrentAffairsPagination
                  currentPage={page}
                  totalPages={data.totalPages}
                  onPageChange={setPage}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
