import ky from "ky";

const api = ky.create({
  prefixUrl: "http://localhost:3333",
  retry: 2,
  credentials: "include",
  throwHttpErrors: false,
});

export { api };
