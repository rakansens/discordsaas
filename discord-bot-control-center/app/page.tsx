/**
 * Home page for Discord Bot Control Center
 * Created: 2025/3/13
 */

import { redirect } from "next/navigation";

export default function Home() {
  // In a real application, we would check if the user is authenticated
  // and redirect to the dashboard if they are, or to the login page if not
  redirect("/login");
}
