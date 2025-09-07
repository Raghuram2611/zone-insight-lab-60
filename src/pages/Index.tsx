import { MainLayout } from "@/components/MainLayout";

interface IndexProps {
  onLogout: () => void;
}

const Index = ({ onLogout }: IndexProps) => {
  return <MainLayout onLogout={onLogout} />;
};

export default Index;
