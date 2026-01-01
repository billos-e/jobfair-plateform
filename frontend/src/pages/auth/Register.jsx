/**
 * Register Page
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Input from '../../components/ui/Input'
import Card from '../../components/ui/Card'
import { Eye, EyeOff } from 'lucide-react'

export default function Register() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        password_confirm: '',
        first_name: '',
        last_name: '',
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { register } = useAuth()
    const navigate = useNavigate()

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (formData.password !== formData.password_confirm) {
            setError('Les mots de passe ne correspondent pas')
            return
        }

        setLoading(true)

        try {
            await register(formData)
            navigate('/login', { state: { registered: true } })
        } catch (err) {
            const errorData = err.response?.data
            if (typeof errorData === 'object') {
                const firstError = Object.values(errorData)[0]
                setError(Array.isArray(firstError) ? firstError[0] : firstError)
            } else {
                setError('Erreur lors de l&apos;inscription')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
            <Card className="w-full max-w-md" padding="lg">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-primary-500">JobFair</h1>
                    <p className="text-neutral-500 mt-2">Créez votre compte étudiant</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 bg-danger-50 text-danger-600 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Prénom"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            placeholder="Jean"
                            required
                        />
                        <Input
                            label="Nom"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            placeholder="Dupont"
                            required
                        />
                    </div>

                    <Input
                        label="Email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="votre@email.com"
                        required
                    />

                    <div className="relative">
                        <Input
                            label="Mot de passe"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-[38px] text-neutral-400 hover:text-neutral-600"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    <div className="relative">
                        <Input
                            label="Confirmer le mot de passe"
                            type={showPasswordConfirm ? 'text' : 'password'}
                            name="password_confirm"
                            value={formData.password_confirm}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-[38px] text-neutral-400 hover:text-neutral-600"
                            onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                        >
                            {showPasswordConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full"
                        loading={loading}
                    >
                        S&apos;inscrire
                    </Button>
                </form>

                <p className="mt-6 text-center text-sm text-neutral-500">
                    Déjà un compte ?{' '}
                    <Link to="/login" className="text-primary-500 hover:underline">
                        Se connecter
                    </Link>
                </p>
            </Card>
        </div>
    )
}
