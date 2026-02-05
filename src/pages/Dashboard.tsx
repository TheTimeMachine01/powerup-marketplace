import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { 
  Package, Users, ShoppingCart, TrendingUp, 
  Search, MoreHorizontal, Loader2, RefreshCw,
  Edit2, Trash2, Eye
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { db } from '@/lib/supabase';
import type { Product, Order, Profile } from '@/types/database';
import { Footer } from '@/components/Footer';

const Dashboard = () => {
  const { isStaff, loading } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!loading && !isStaff) {
      navigate('/');
    }
  }, [isStaff, loading, navigate]);

  useEffect(() => {
    if (isStaff) {
      fetchDashboardData();
    }
  }, [isStaff]);

  const fetchDashboardData = async () => {
    setLoadingData(true);
    try {
      const [productsRes, ordersRes, customersRes] = await Promise.all([
        db.from('products').select('*').order('created_at', { ascending: false }),
        db.from('orders').select('*').order('created_at', { ascending: false }).limit(50),
        db.from('profiles').select('*').eq('role', 'customer').order('created_at', { ascending: false }).limit(50),
      ]);

      if (productsRes.data) setProducts(productsRes.data as Product[]);
      if (ordersRes.data) setOrders(ordersRes.data as Order[]);
      if (customersRes.data) setCustomers(customersRes.data as Profile[]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400';
      case 'confirmed': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'shipped': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
      case 'delivered': return 'bg-green-500/10 text-green-600 dark:text-green-400';
      case 'cancelled': return 'bg-red-500/10 text-red-600 dark:text-red-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isStaff) {
    return null;
  }

  const totalRevenue = orders.reduce((sum, order) => 
    order.payment_status === 'completed' ? sum + (order.total_amount || 0) : sum, 0
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage your store operations</p>
          </div>
          <Button onClick={fetchDashboardData} variant="outline" className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loadingData ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        
        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-border/50 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Package className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{products.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Active in inventory</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <ShoppingCart className="h-4 w-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{orders.length}</div>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Customers</CardTitle>
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Users className="h-4 w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{customers.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Registered users</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle>
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <TrendingUp className="h-4 w-4 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">₹{totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card className="border-border/50 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Track and manage customer orders</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {loadingData ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">No orders yet</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
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
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-sm">
                            {order.id.slice(0, 8)}...
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={
                              order.payment_status === 'completed' 
                                ? 'border-green-500 text-green-600' 
                                : 'border-yellow-500 text-yellow-600'
                            }>
                              {order.payment_status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ₹{order.total_amount?.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {order.created_at ? new Date(order.created_at).toLocaleDateString() : '-'}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="mr-2 h-4 w-4" /> View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit2 className="mr-2 h-4 w-4" /> Update Status
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card className="border-border/50 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Product Management</CardTitle>
                    <CardDescription>View and manage your product inventory</CardDescription>
                  </div>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search products..." 
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {loadingData ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">No products found</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
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
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.brand}</TableCell>
                          <TableCell>{product.ah_rating} AH</TableCell>
                          <TableCell className="text-right">₹{product.price?.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={
                              product.stock_quantity > 5 
                                ? 'bg-green-500/10 text-green-600' 
                                : 'bg-red-500/10 text-red-600'
                            }>
                              {product.stock_quantity} units
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Edit2 className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers">
            <Card className="border-border/50 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                <CardTitle>Customer Overview</CardTitle>
                <CardDescription>View registered customers</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {loadingData ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : customers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">No customers yet</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell className="font-medium">
                            {customer.full_name || 'Unnamed User'}
                          </TableCell>
                          <TableCell>{customer.phone || '-'}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{customer.role}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {customer.created_at ? new Date(customer.created_at).toLocaleDateString() : '-'}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
