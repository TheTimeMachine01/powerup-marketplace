import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Product } from "@/types/database";

const productSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    brand: z.string().min(2, "Brand must be at least 2 characters"),
    category: z.enum(["car", "bike", "inverter", "solar"]),
    price: z.coerce.number().min(0, "Price must be positive"),
    stock_quantity: z.coerce.number().min(0, "Stock must be positive"),
    ah_rating: z.coerce.number().min(0, "AH Rating must be positive"),
    warranty_months: z.coerce.number().min(0, "Warranty must be positive"),
    scrap_value: z.coerce.number().min(0, "Scrap value must be positive").default(0),
    image_url: z.string().url("Invalid URL").optional().or(z.literal("")),
    vehicle_type: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
    initialData?: Product | null;
    onSuccess: () => void;
    onCancel: () => void;
}

export function ProductForm({ initialData, onSuccess, onCancel }: ProductFormProps) {
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: initialData?.name || "",
            brand: initialData?.brand || "",
            category: (initialData?.category as any) || "car",
            price: initialData?.price || 0,
            stock_quantity: initialData?.stock_quantity || 0,
            ah_rating: initialData?.ah_rating || 0,
            warranty_months: initialData?.warranty_months || 0,
            scrap_value: initialData?.scrap_value || 0,
            image_url: initialData?.image_url || "",
            vehicle_type: initialData?.vehicle_type || "",
        },
    });

    const onSubmit = async (values: ProductFormValues) => {
        setIsLoading(true);
        try {
            if (initialData) {
                // Update existing product
                const { error } = await supabase
                    .from("products")
                    .update(values)
                    .eq("id", initialData.id);

                if (error) throw error;
                toast.success("Product updated successfully");
            } else {
                // Create new product
                const { error } = await supabase
                    .from("products")
                    .insert(values as any);

                if (error) throw error;
                toast.success("Product created successfully");
            }
            onSuccess();
        } catch (error) {
            console.error("Error saving product:", error);
            toast.error("Failed to save product");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Product name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="brand"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Brand</FormLabel>
                                <FormControl>
                                    <Input placeholder="Exide, Amaron..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="car">Car Battery</SelectItem>
                                        <SelectItem value="bike">Bike Battery</SelectItem>
                                        <SelectItem value="inverter">Inverter Battery</SelectItem>
                                        <SelectItem value="solar">Solar Battery</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Price (₹)</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <FormField
                        control={form.control}
                        name="ah_rating"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>AH Rating</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="stock_quantity"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Stock</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="warranty_months"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Warranty (Months)</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="scrap_value"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Scrap Value (₹)</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="vehicle_type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Vehicle Type (Optional)</FormLabel>
                                <FormControl>
                                    <Input placeholder="SUV, Sedan..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="image_url"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Image URL</FormLabel>
                            <FormControl>
                                <Input placeholder="https://..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {initialData ? "Update Product" : "Add Product"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
