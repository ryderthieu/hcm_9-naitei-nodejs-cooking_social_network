import { Route, Routes } from "react-router-dom";
import Login from "../pages/auth/Login/Login";
import NotFound from "../pages/other/NotFound/NotFound";
import Feed from "../pages/main/Feed/Feed";
import Register from "../pages/auth/Register/Register";
import ForgotPassword from "../pages/auth/ForgotPassword/ForgotPassword";
import MainLayout from "../layouts/MainLayout";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import CreateRecipe from "../pages/recipe/CreateRecipe";
import MessagePage from "../pages/main/Message/MessagePage";
import CommunityRecipes from "../pages/recipe/CommunityRecipes";
import TrendingBlog from "../pages/blog/TrendingBlog";
import NewBlog from "../pages/blog/NewBlog";
import HighlightedBlog from "../pages/blog/HighlightedBlog";
import Blog1 from "../pages/blog/Blog1";
import Blog2 from "../pages/blog/Blog2";
import Blog3 from "../pages/blog/Blog3";
import Blog4 from "../pages/blog/Blog4";
import AccountPage from "../pages/main/Account/AccountPage";
import ProfilePage from "../pages/main/Profile/ProfilePage";
import DetailRecipe from "../pages/recipe/DetailRecipe";
import PostDetail from "../pages/main/PostDetail/PostDetail";
import DetailRecipe from "../pages/recipe/DetailRecipe";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route 
        path="/" 
        element={
          <MainLayout header={<Header />} footer={<Footer />}>
            <Feed />
          </MainLayout>
        } 
      />
      <Route path="*" element={<NotFound />} />
      <Route path="/messages" element={<MessagePage />} />
      <Route path="/messages/:conversationId" element={<MessagePage />} />
      <Route
        path="/account"
        element={
          <MainLayout header={<Header />} footer={<Footer />}>
            <AccountPage />
          </MainLayout>
        }
      />
      <Route
        path="/profile/:username"
        element={
          <MainLayout header={<Header />} footer={<Footer />}>
            <ProfilePage />
          </MainLayout>
        }
      />
      <Route
        path="/post/:id"
        element={
          <MainLayout header={<Header />} footer={<Footer />}>
            <PostDetail />
          </MainLayout>
        }
      />
      <Route
        path="/create-recipe"
        element={
          <MainLayout header={<Header />} footer={<Footer />}>
            <CreateRecipe />
          </MainLayout>
        }
      />

      <Route
        path="/community-recipes"
        element={
          <MainLayout header={<Header />} footer={<Footer />}>
            <CommunityRecipes />
          </MainLayout>
        }
      />

      <Route
        path="/blog/trending-article"
        element={
          <MainLayout header={<Header />} footer={<Footer />}>
            <TrendingBlog />
          </MainLayout>
        }
      />

      <Route
        path="/blog/new-article"
        element={
          <MainLayout header={<Header />} footer={<Footer />}>
            <NewBlog />
          </MainLayout>
        }
      />

      <Route
        path="/blog/highlighted-article"
        element={
          <MainLayout header={<Header />} footer={<Footer />}>
            <HighlightedBlog />
          </MainLayout>
        }
      />

      <Route
        path="/blog/1"
        element={
          <MainLayout header={<Header />} footer={<Footer />}>
            <Blog1 />
          </MainLayout>
        }
      />

      <Route
        path="/blog/2"
        element={
          <MainLayout header={<Header />} footer={<Footer />}>
            <Blog2 />
          </MainLayout>
        }
      />

      <Route
        path="/blog/3"
        element={
          <MainLayout header={<Header />} footer={<Footer />}>
            <Blog3 />
          </MainLayout>
        }
      />

      <Route
        path="/blog/4"
        element={
          <MainLayout header={<Header />} footer={<Footer />}>
            <Blog4 />
          </MainLayout>
        }
      />

      <Route
        path="/detail-recipe/:id"
        element={
          <MainLayout header={<Header />} footer={<Footer />}>
            <DetailRecipe />
          </MainLayout>
        }
      />
    </Routes>
  );
}
