import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Package, Users, ShoppingCart, TrendingUp,
  Search, MoreHorizontal, Loader2, RefreshCw,
  Edit2, Trash2, Eye, AlertTriangle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Product, Order, Profile } from '@/types/database';
import { Footer } from '@/components/Footer';
import { ProductForm } from '@/components/dashboard/ProductForm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus } from 'lucide-react';

import { useProducts, useProductMutations } from "@/hooks/use-products";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  // Use React Query for products
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { deleteProduct } = useProductMutations();

  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Product Management State
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    console.log('Fetching dashboard data...');
    setLoadingData(true);
    try {
      const [ordersRes, customersRes] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(50),
      ]);

      if (ordersRes.data) setOrders(ordersRes.data as Order[]);
      if (customersRes.data) setCustomers(customersRes.data as Profile[]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoadingData(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      // Update local state
      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus as Order['status'] } : order
      ));

      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      const message = error instanceof Error ? error.message : 'Failed to update order status';
      toast.error(message);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    setIsDeleting(true);
    try {
      await deleteProduct.mutateAsync(productId);
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  const openAddProduct = () => {
    setEditingProduct(null);
    setIsProductDialogOpen(true);
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsProductDialogOpen(true);
  };

  const handleProductSaved = () => {
    setIsProductDialogOpen(false);
    fetchDashboardData(); // Refresh data
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPaymentColor = (status: string) => {
    if (status === 'completed') {
      return 'border-green-500/30 text-green-600 dark:text-green-400';
    } else if (status === 'pending') {
      return 'border-yellow-500/30 text-yellow-600 dark:text-yellow-400';
    }
    return 'border-red-500/30 text-red-600 dark:text-red-400';
  };

  return (
    <div className="min-h-screen bg-background dark:bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">Dashboard</h1>
            <p className="text-muted-foreground mt-2">Manage your e-commerce operations</p>
          </div>
          <Button onClick={fetchDashboardData} variant="outline" className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loadingData ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loadingData ? (
            [...Array(4)].map((_, i) => (
              <Card key={i} className="border-border/50 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-12 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card className="border-border/50 shadow-lg hover:shadow-xl transition-shadow dark:border-border/50">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
                  <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg">
                    <Package className="h-4 w-4 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{products.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">Active in inventory</p>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-lg hover:shadow-xl transition-shadow dark:border-border/50">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
                  <div className="p-2 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg">
                    <ShoppingCart className="h-4 w-4 text-blue-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{orders.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">This month</p>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-lg hover:shadow-xl transition-shadow dark:border-border/50">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Customers</CardTitle>
                  <div className="p-2 bg-green-500/10 dark:bg-green-500/20 rounded-lg">
                    <Users className="h-4 w-4 text-green-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{customers.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">Registered users</p>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-lg hover:shadow-xl transition-shadow dark:border-border/50">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle>
                  <div className="p-2 bg-purple-500/10 dark:bg-purple-500/20 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-purple-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">₹{(orders.reduce((sum, order) =>
                    order.status === 'delivered' ? sum + (order.total_amount || 0) : sum, 0
                  )).toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">This month</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="orders">Recent Orders</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card className="border-border/50 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent dark:from-primary/10">
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Track and manage customer orders | <span className="text-xs">Click status/payment to update</span></CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {loadingData ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground/50 dark:text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">No orders yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="dark:border-border/50">
                          <TableHead>Order ID</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Payment</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.slice(0, 10).map((order) => (
                          <TableRow key={order.id} className="dark:border-border/50">
                            <TableCell className="font-mono text-sm">
                              {order.id.slice(0, 8)}...
                            </TableCell>
                            <TableCell>
                              <Select
                                value={order.status}
                                onValueChange={(value) => updateOrderStatus(order.id, value)}
                                disabled={updatingOrderId === order.id}
                              >
                                <SelectTrigger className="w-32 h-8 text-xs dark:border-border">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="confirmed">Confirmed</SelectItem>
                                  <SelectItem value="shipped">Shipped</SelectItem>
                                  <SelectItem value="delivered">Delivered</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              ₹{order.total_amount?.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN') : '-'}
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="icon" disabled>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card className="border-border/50 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent dark:from-primary/10">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <CardTitle>Product Management</CardTitle>
                    <CardDescription>View and manage your product inventory | Low stock items highlighted</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search products..."
                        className="pl-10 dark:bg-muted/50 dark:border-border"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Button onClick={openAddProduct} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Product
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {loadingData ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground/50 dark:text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">No products found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="dark:border-border/50">
                          <TableHead>Product</TableHead>
                          <TableHead>Brand</TableHead>
                          <TableHead>AH Rating</TableHead>
                          <TableHead className="text-right">Price</TableHead>
                          <TableHead>Stock</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProducts.slice(0, 15).map((product) => (
                          <TableRow key={product.id} className="dark:border-border/50">
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell className="text-muted-foreground">{product.brand}</TableCell>
                            <TableCell>{product.ah_rating} AH</TableCell>
                            <TableCell className="text-right font-semibold">₹{product.price?.toLocaleString()}</TableCell>
                            <TableCell>
                              {product.stock_quantity < 5 ? (
                                <Badge variant="destructive" className="gap-1 dark:bg-destructive/20 dark:text-destructive">
                                  <AlertTriangle className="h-3 w-3" />
                                  {product.stock_quantity} units
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className='bg-green-500/10 text-green-600 dark:text-green-400'>
                                  {product.stock_quantity} units
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" className="dark:hover:bg-muted/50" onClick={() => openEditProduct(product)}>
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive dark:hover:bg-destructive/10">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will permanently delete "{product.name}". This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteProduct(product.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers">
            <Card className="border-border/50 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent dark:from-primary/10">
                <CardTitle>Customer Overview</CardTitle>
                <CardDescription>View and manage registered customers</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {loadingData ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : customers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground/50 dark:text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">No customers yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="dark:border-border/50">
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {customers.map((customer) => (
                          <TableRow key={customer.id} className="dark:border-border/50">
                            <TableCell className="font-medium">
                              {customer.full_name || 'Unnamed User'}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground truncate">{customer.email || '-'}</TableCell>
                            <TableCell className="text-muted-foreground">{customer.phone || '-'}</TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {customer.created_at ? new Date(customer.created_at).toLocaleDateString('en-IN') : '-'}
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="icon" className="dark:hover:bg-muted/50">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />

      {/* Product Form Dialog */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Make changes to your product here.' : 'Add details for a new product to your inventory.'}
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            initialData={editingProduct}
            onSuccess={handleProductSaved}
            onCancel={() => setIsProductDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
