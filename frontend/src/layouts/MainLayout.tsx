import React from "react";

interface MainLayoutProps {
  header?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  header,
  children,
  footer,
}) => {
  return (
    <div className="flex flex-col min-h-screen">
      {header}
      <main className="flex-1 mt-[70px]">{children}</main>
      {footer}
    </div>
  );
};

export default MainLayout;
