import Link from "next/link";

export function Footer () {
    return (
        <footer className="border-t">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className="font-display text-lg font-semibold"> Clocktower</p>
          
          <p className="text-muted-foreground mt-2 text-sm">
            Student housing in Ormskirk, ranked by walk time to Edge Hill.
          </p>
          </div>
            <div>
          <p className="text-sm font-medium">For students</p>
          <ul className="text-muted-foreground mt-2 space-y-1 text-sm">
            <li><Link href="/properties" className="hover:text-foreground">Search properties </Link></li>
            <li><Link href="/properties" className="hover:text-foreground">Create an account </Link></li>
          </ul>
          </div>
            <div>
          <p className="text-sm font-medium">For landlords</p>
          <ul className="text-muted-foreground mt-2 space-y-1 text-sm">
            <li><Link href="/properties" className="hover:text-foreground">List a property</Link></li>
          </ul>
         </div>
        </div>
         <p className="text-muted-foreground mt-8 text-xs">
             © {new Date().getFullYear()} Clocktower. A student project, not an affiliate of Edge Hill University.
         </p>
          </div> 
        </footer>
    );
}