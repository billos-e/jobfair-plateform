/**
 * Login Page
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Card from '../../components/ui/Card'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const user = await login(email, password)
            // Redirect based on role
            if (user.role === 'admin') {
                navigate('/admin')
            } else {
                navigate('/dashboard')
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Email ou mot de passe incorrect')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
            <Card className="w-full max-w-md" padding="lg">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-primary-500">JobFair</h1>
                    <p className="text-neutral-500 mt-2">Connectez-vous à votre compte</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 bg-danger-50 text-danger-600 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <Input
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="votre@email.com"
                        required
                    />

                    <Input
                        label="Mot de passe"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                    />

                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full"
                        loading={loading}
                    >
                        Se connecter
                    </Button>
                </form>

                <p className="mt-6 text-center text-sm text-neutral-500">
                    Pas encore de compte ?{' '}
                    <Link to="/register" className="text-primary-500 hover:underline">
                        S&apos;inscrire
                    </Link>
                </p>
            </Card>
        </div>
    )
}
