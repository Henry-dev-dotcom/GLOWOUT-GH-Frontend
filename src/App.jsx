import { useMemo } from 'react';
import { StoreProvider } from './context/StoreContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { StoreLayout } from './components/Layout';
import { useHashRouter } from './hooks/useHashRouter';
import { AccountPage, AboutPage, BlogPage, CartPage, CategoriesPage, CheckoutPage, ContactPage, FAQPage, HomePage, LoginPage, OrderConfirmationPage, PaymentStatusPage, ProductDetailPage, ResetPasswordPage, ReturnsPolicyPage, ReviewsPage, ShopPage, TrackingPage, WishlistPage } from './pages/storefront';
import { AdminDashboard, AnalyticsPage, CategoryManager, CouponsManager, CustomersManager, FinancePage, MarketingPage, OrdersManager, ProductManager, ReturnsManager, SettingsPage, TeamPage } from './pages/admin';

function AppRouter() {
  const { route, navigate } = useHashRouter();
  const { view, params } = route;

  const adminPages = useMemo(() => ({
    'admin.dashboard': <AdminDashboard view={view} navigate={navigate} />,
    'admin.products': <ProductManager view={view} navigate={navigate} />,
    'admin.categories': <CategoryManager view={view} navigate={navigate} />,
    'admin.orders': <OrdersManager view={view} navigate={navigate} />,
    'admin.coupons': <CouponsManager view={view} navigate={navigate} />,
    'admin.returns': <ReturnsManager view={view} navigate={navigate} />,
    'admin.customers': <CustomersManager view={view} navigate={navigate} />,
    'admin.analytics': <AnalyticsPage view={view} navigate={navigate} />,
    'admin.marketing': <MarketingPage view={view} navigate={navigate} />,
    'admin.finance': <FinancePage view={view} navigate={navigate} />,
    'admin.settings': <SettingsPage view={view} navigate={navigate} />,
    'admin.team': <TeamPage view={view} navigate={navigate} />
  }), [view, navigate]);

  if (adminPages[view]) return adminPages[view];

  let page;
  switch (view) {
    case 'shop': page = <ShopPage navigate={navigate} params={params} />; break;
    case 'categories': page = <CategoriesPage navigate={navigate} />; break;
    case 'product': page = <ProductDetailPage navigate={navigate} params={params} />; break;
    case 'cart': page = <CartPage navigate={navigate} />; break;
    case 'checkout': page = <CheckoutPage navigate={navigate} />; break;
    case 'order-confirmation': page = <OrderConfirmationPage navigate={navigate} params={params} />; break;
    case 'payment-status': page = <PaymentStatusPage navigate={navigate} params={params} />; break;
    case 'wishlist': page = <WishlistPage navigate={navigate} />; break;
    case 'tracking': page = <TrackingPage params={params} />; break;
    case 'login': page = <LoginPage navigate={navigate} mode="login" />; break;
    case 'register': page = <LoginPage navigate={navigate} mode="register" />; break;
    case 'forgot-password': page = <LoginPage navigate={navigate} mode="forgot" />; break;
    case 'reset-password': page = <ResetPasswordPage navigate={navigate} params={params} />; break;
    case 'account': page = <AccountPage navigate={navigate} />; break;
    case 'contact': page = <ContactPage />; break;
    case 'about': page = <AboutPage navigate={navigate} />; break;
    case 'faq': page = <FAQPage navigate={navigate} />; break;
    case 'returns': page = <ReturnsPolicyPage navigate={navigate} />; break;
    case 'reviews': page = <ReviewsPage navigate={navigate} />; break;
    case 'blog': page = <BlogPage navigate={navigate} params={params} />; break;
    default:
      page = <HomePage navigate={navigate} />;
  }

  return <StoreLayout view={view} navigate={navigate}>{page}</StoreLayout>;
}

export default function App() {
  return (
    <ErrorBoundary>
      <StoreProvider><AppRouter /></StoreProvider>
    </ErrorBoundary>
  );
}
