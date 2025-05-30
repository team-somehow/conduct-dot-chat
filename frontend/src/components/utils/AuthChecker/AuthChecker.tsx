import { AuthContext } from "@/context/global/auth/AuthContext";
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import LoadingOverlay from "../LoadingOverlay/LoadingOverlay";

interface ApplicantAuthCheckerProps {
  children: React.ReactNode;
}

const ApplicantAuthChecker: React.FC<ApplicantAuthCheckerProps> = ({
  children,
}) => {
  const { authLoading, user } = useContext(AuthContext);

  if (authLoading && !user) {
    return <LoadingOverlay isLoading={authLoading} />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ApplicantAuthChecker;
