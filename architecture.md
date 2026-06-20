# Architecture du projet Permis Express

Date: 2026-06-20

Ce document décrit l'architecture technique, le schéma des composants et un plan détaillé des étapes de développement. Pour chaque étape terminée, la mention "OK" est ajoutée.

---

## Vue d'ensemble

- Frontend: Next.js 15 (App Router) + TypeScript + Tailwind CSS.
- Backend / BDD: Supabase (PostgreSQL, Auth, Storage).
- Paiement: Stripe Checkout + webhooks.
- Emails: Brevo (à intégrer dans webhook après paiement).
- Hébergement: Vercel (Serverless functions pour les API routes et webhooks).

---

## Arborescence principale

```
dossier-app/
  app/
    page.tsx                # Landing page (Hero, Avantages, Process, FAQ, Contact)
    deposer-dossier/page.tsx# Formulaire de dépôt
    merci/page.tsx          # Page de confirmation
    admin/
      login/page.tsx       # Login admin (Supabase Auth)
      page.tsx             # Dashboard admin (liste, actions)
    api/
      create-checkout-session/route.ts  # API: crée une session Stripe
      webhook/route.ts                  # API: webhook Stripe
  components/
    Header.tsx
    Footer.tsx
    Hero.tsx
    Benefits.tsx
    Process.tsx
    FAQ.tsx
    Contact.tsx
    FileUpload.tsx
    DossierForm.tsx        # Logique: create dossier, upload, appelle Stripe
    AdminHeader.tsx
    AdminDossierList.tsx
  lib/
    supabase.ts            # Client Supabase
  public/
    flyer-mock.jpg
  README.md
  architecture.md         # <-- ce fichier
  .env.local              # variables locales (ne pas committer)
```

---

## Schéma des données (résumé)

- Table `dossiers` (colonnes principales):
  - `id` (UUID)
  - `numero_dossier` (string)
  - `nom`, `prenom`, `email`, `telephone`, `whatsapp`, `adresse`, `pays_permis`
  - `statut` (enum: NOUVEAU, PAYE, CONTACTE, EN_COURS, COMPLET, TERMINE, REFUSE)
  - `montant` (integer en cents)
  - `paiement_effectue` (boolean)
  - `stripe_payment_id` (string)
  - `created_at`, `updated_at`

- Table `documents`:
  - `id`, `dossier_id` (FK), `nom_fichier`, `chemin_storage`, `type_document`, `created_at`

Bucket Supabase Storage: `documents` (privé) — contient les fichiers téléversés.

---

## Flux principaux

1. Déposer un dossier (utilisateur)
   - L'utilisateur remplit `DossierForm` et téléverse des fichiers via `FileUpload`.
   - Frontend crée un enregistrement `dossiers` (statut `NOUVEAU`, `paiement_effectue=false`).
   - Frontend upload chaque fichier dans le bucket `documents` puis crée l'entrée correspondante en table `documents`.
   - Frontend appelle `POST /api/create-checkout-session` (server) avec `numero` et `dossierId`.
   - Server crée une session Stripe Checkout et renvoie `session.url`.
   - Frontend redirige l'utilisateur vers Stripe Checkout.
   - Stripe envoie `checkout.session.completed` au webhook configuré.
   - Webhook vérifie la signature (`STRIPE_WEBHOOK_SECRET`) et met à jour `dossiers.paiement_effectue = true` (via `SUPABASE_SERVICE_ROLE_KEY`).

2. Espace Admin
   - Auth via Supabase Auth (`/admin/login`).
   - Dashboard (`/admin`) liste les dossiers (filtrage, recherche) et propose actions: changer statut, télécharger fichiers.

---

## API server (fonctions importantes)

- `POST /api/create-checkout-session` — crée la session Stripe (utilise `STRIPE_SECRET_KEY`).
- `POST /api/webhook` — webhook Stripe (vérifie signature puis met à jour la base via la key service role).

Ces routes sont server-side et utilisent des variables d'environnement non publiques.

---

## Sécurité & bonnes pratiques

- Ne pas exposer `SUPABASE_SERVICE_ROLE_KEY` ou `STRIPE_SECRET_KEY` dans le frontend.
- Stocker ces secrets dans Vercel (Environment Variables) et marquer comme `Protected`/server-side.
- Utiliser le webhook secret (`STRIPE_WEBHOOK_SECRET`) pour vérifier la provenance des événements.
- Pour les fichiers sensibles, garder le bucket `documents` privé et générer des URLs signées pour le téléchargement.

---

## Plan détaillé des tâches (étapes) — suivi d'avancement

1. Mettre en place la landing page (Hero, Avantages, Processus, FAQ, Contact) — OK
   - Fichier: `app/page.tsx` — ✅ OK

2. Créer composants réutilisables (Header, Footer, Hero, Benefits, Process, FAQ, Contact) — OK
   - Dossier: `components/*` — ✅ OK

3. Implémenter la page de dépôt `/deposer-dossier` et le formulaire avec upload — OK
   - `app/deposer-dossier/page.tsx`, `components/DossierForm.tsx`, `components/FileUpload.tsx` — ✅ OK

4. Intégrer la logique Supabase pour créer les enregistrements et uploader les fichiers — OK
   - Utilisation de `supabase.storage` et inserts dans `dossiers` & `documents` — ✅ OK

5. Ajouter Stripe Checkout (session creation) et webhook pour marquer le paiement — OK
   - `app/api/create-checkout-session/route.ts` — ✅ OK
   - `app/api/webhook/route.ts` — ✅ OK

6. Ajouter la page de remerciement `/merci` (affiche numéro dossier) — OK
   - `app/merci/page.tsx` — ✅ OK

7. Créer l'espace admin avec authentification Supabase — OK
   - `app/admin/login/page.tsx`, `app/admin/page.tsx`, `components/AdminHeader.tsx`, `components/AdminDossierList.tsx` — ✅ OK

8. Ajouter README et documentation de déploiement — OK
   - `README.md` — ✅ OK

9. Configurer webhooks Stripe et variables sur Vercel — En attente (à faire par déploiement)
   - Ajouter `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL` sur Vercel — (À FAIRE)

10. Envoyer emails (Brevo) après paiement (optionnel) — En attente
   - Intégrer l'appel API Brevo dans le handler webhook (envoyer confirmation client + alerte admin) — (À FAIRE)

11. Améliorations & sécurité
   - Ajouter RLS / policies si nécessaire, générer URLs signées pour les téléchargements, pagination & filtres dans admin — (À FAIRE)

---

## Notes opérationnelles

- Pour tester les webhooks en local : `stripe listen --forward-to localhost:3000/api/webhook`.
- Sur Vercel, créer un endpoint webhook Stripe vers `https://<votre-site>.vercel.app/api/webhook`.
- Après déploiement, vérifiez les logs Vercel pour la réception des événements et les erreurs du webhook.

---

Si vous souhaitez, je peux maintenant :
- Rédiger la procédure pas-à-pas pour ajouter les variables dans Vercel (texte prêt à copier),
- Implémenter l'envoi d'emails Brevo dans le webhook (confirmation client + admin),
- Ajouter des tests unitaires / e2e légers pour les API routes.

*** Fin de l'architecture & plan
