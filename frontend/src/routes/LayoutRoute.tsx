import MainLayout from "../layouts/MainLayout";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

interface LayoutRouteProps {
  element: React.ReactNode;
}

const LayoutRoute = ({ element }: LayoutRouteProps) => {
  return (
    <MainLayout header={<Header />} footer={<Footer />}>
      {element}
    </MainLayout>
  );
};

export default LayoutRoute;
