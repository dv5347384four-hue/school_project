export default function LoginPage() {
  return <div className="mx-auto mt-20 max-w-md rounded bg-white p-6 shadow"><h1 className="mb-4 text-xl font-bold">Вход в школьный дневник</h1><form className="space-y-3"><input className="w-full rounded border p-2" placeholder="Email"/><input className="w-full rounded border p-2" placeholder="Пароль" type="password"/><button className="w-full rounded bg-blue-600 p-2 text-white">Войти</button></form></div>;
}
