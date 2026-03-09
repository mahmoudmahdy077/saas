import { Redirect } from 'expo-router';
import { useAuthStore } from '../lib/stores/authStore';

export default function Index() {
    const { user, profile } = useAuthStore();

    if (!user) return <Redirect href="/(auth)/login/" />;

    const role = profile?.role;
    if (role === 'super_admin') return <Redirect href="/(super_admin)/dashboard/" />;
    if (role === 'institution_admin') return <Redirect href="/(institution_admin)/dashboard/" />;
    if (role === 'program_director') return <Redirect href="/(program_director)/dashboard/" />;
    if (role === 'consultant') return <Redirect href="/(consultant)/dashboard/" />;

    return <Redirect href="/(main)/dashboard/" />;
}
