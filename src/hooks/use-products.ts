import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/database";

export const useProducts = () => {
    return useQuery({
        queryKey: ["products"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("products")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data as Product[];
        },
    });
};

export const useDeals = () => {
    return useQuery({
        queryKey: ["deals"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("products")
                .select("*")
                .gt("stock_quantity", 0)
                .order("scrap_value", { ascending: false })
                .limit(10);

            if (error) throw error;
            return data as Product[];
        },
    });
};

export const useProductMutations = () => {
    const queryClient = useQueryClient();

    const addProduct = useMutation({
        mutationFn: async (newProduct: any) => {
            // Explicitly cast to any to avoid TS issues with DB types vs Form types
            const { data, error } = await supabase.from("products").insert(newProduct as any).select().single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            queryClient.invalidateQueries({ queryKey: ["deals"] });
        },
    });

    const updateProduct = useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
            const { data, error } = await supabase
                .from("products")
                .update(updates as any)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            queryClient.invalidateQueries({ queryKey: ["deals"] });
        },
    });

    const deleteProduct = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from("products").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            queryClient.invalidateQueries({ queryKey: ["deals"] });
        },
    });

    return { addProduct, updateProduct, deleteProduct };
};
