import { signIn } from "next-auth/react";

// UI
import { FormSubmit } from "@/app/ui/form";
import { ButtonSolid } from "@/app/ui/button";

// Font Awesome Icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";

function findIconByProvider(id) {
    switch (id) {
        case "google":
            return faGoogle;
        default:
            return null;
    }
}

export function SignInWithCreds({ children, provider }) {
    async function handleSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        await signIn(provider.id, data);
    }

    return (
        <FormSubmit id={`form-${provider.name}`} handleSubmit={handleSubmit}>
            {children}
            <ButtonSolid type="submit" className="w-full">
                <span>Sign in</span>
            </ButtonSolid>
        </FormSubmit>
    );
}

export function SignInWithProvider({ provider }) {
    const title = `Sign in with ${provider.name}`;
    return (
        <ButtonSolid type="submit" title={title} className="inline-grid grid-cols-[auto_1fr] w-full" onClick={() => signIn(provider.id)}>
            <FontAwesomeIcon icon={findIconByProvider(provider.id)} />
            <span>{title}</span>
        </ButtonSolid>
	);
}