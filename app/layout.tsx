import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata={title:'Chiru — A calmer home for your money',description:'Plan your monthly budget, track expenses, save toward goals and give with intention. Create your private Chiru workspace.',icons:{icon:'/icon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}<script src="/retire-old-cache.js" defer/></body></html>}
