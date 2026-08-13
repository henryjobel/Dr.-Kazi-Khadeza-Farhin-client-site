import { AppointmentForm, Header } from "./App.jsx";

export default function AppointmentPage() {
  return (
    <>
      <Header />
      <main className="bg-[#f8fbfb] pt-28">
        <AppointmentForm />
      </main>
    </>
  );
}
