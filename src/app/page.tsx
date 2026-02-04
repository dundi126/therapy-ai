"use client"


import { Button } from "@/components/ui/button"
import { Input } from "@base-ui/react"
import { useState } from "react"
import { authClient } from "@/lib/auth-client";

export default function Home() {
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [email, setEmail] = useState("")

  const onSubmit = () => authClient.signUp.email({
        email, 
        password, 
        name, 
    }, {
        onSuccess: (ctx) => {
            window.alert("Success")
        },
        onError: (ctx) => {
            window.alert(`something went wrong: ${ctx.error.message}`)
        },
});


  return (
    <div className="p-4 flex flex-col gap-4">
      <h1>Welcome to the Home Page</h1>
      <Input placeholder="name" value={name} onChange={e => setName(e.target.value)} />
      <Input placeholder="email" value={email} onChange={e => setEmail(e.target.value)} />
      <Input placeholder="password" type="password" value={password} onChange={ e => setPassword(e.target.value)} />
      <Button onClick={onSubmit}>Create User</Button>
    </div>
  )
}
