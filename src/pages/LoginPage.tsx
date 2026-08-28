import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function LoginPage() {
  const { user, loading, signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  if (!loading && user) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setMessage('')
    setSubmitting(true)

    const action = mode === 'login' ? signIn : signUp
    const { error } = await action(email.trim(), password)

    setSubmitting(false)
    if (error) {
      setMessage(error)
      return
    }

    if (mode === 'register') {
      setMessage('注册成功，请登录（若已开启邮箱验证，请先完成验证）')
      setMode('login')
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center bg-white px-6">
      <div className="mb-8 text-center">
        <p className="text-xs tracking-widest text-neutral-500">LOOKPLOG</p>
        <h1 className="mt-1 text-2xl font-semibold text-neutral-900">个人衣橱</h1>
        <p className="mt-2 text-sm text-neutral-500">
          {mode === 'login' ? '登录后管理你的服装' : '创建账号开始使用'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block space-y-1.5">
          <span className="text-xs text-neutral-500">邮箱</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-neutral-400"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs text-neutral-500">密码</span>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="至少 6 位"
            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-neutral-400"
          />
        </label>

        {message && (
          <p className="text-xs text-neutral-600">{message}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-neutral-900 py-3 text-sm font-medium text-white disabled:opacity-60"
        >
          {submitting ? '处理中…' : mode === 'login' ? '登录' : '注册'}
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          setMode(mode === 'login' ? 'register' : 'login')
          setMessage('')
        }}
        className="mt-4 text-center text-sm text-neutral-500 hover:text-neutral-900"
      >
        {mode === 'login' ? '没有账号？去注册' : '已有账号？去登录'}
      </button>
    </div>
  )
}
