// Shape of the data sealed into the session cookie by nuxt-auth-utils. Lives
// under shared/ so both the Nitro server and the Vue app type-check against it.
// Only non-sensitive identity fields are stored; everything else is read from
// the database on demand.
declare module '#auth-utils' {
  interface User {
    id: string
    email: string
    name: string
  }
}

export {}
