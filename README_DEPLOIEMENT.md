# 🚀 Déploiement QM Garage PWA — Guide étape par étape

## Ce que tu vas obtenir
Une vraie app sur l'écran d'accueil de ton iPhone/iPad,
icône QM Garage, plein écran, fonctionne hors-ligne.
Gratuit, sans App Store.

---

## ÉTAPE 1 — Créer un compte GitHub (gratuit)
1. Va sur https://github.com
2. Clique "Sign up" → crée un compte (email + mot de passe)
3. Vérifie ton email

---

## ÉTAPE 2 — Mettre le projet sur GitHub
1. Une fois connecté sur GitHub, clique le "+" en haut à droite
2. "New repository"
3. Nom : `qm-garage-pwa`
4. Laisse tout par défaut → clique "Create repository"
5. Sur la page suivante, clique "uploading an existing file"
6. **Glisse-dépose TOUS les fichiers du dossier** `qm-garage-pwa`
   (respecte la structure : public/, src/, package.json, netlify.toml)
7. Clique "Commit changes"

---

## ÉTAPE 3 — Créer un compte Netlify (gratuit)
1. Va sur https://netlify.com
2. Clique "Sign up" → choisis "Sign up with GitHub"
3. Autorise Netlify à accéder à GitHub

---

## ÉTAPE 4 — Déployer en 3 clics
1. Sur Netlify, clique "Add new site" → "Import an existing project"
2. Choisis "Deploy with GitHub"
3. Sélectionne ton repo `qm-garage-pwa`
4. Les paramètres se remplissent automatiquement grâce au netlify.toml :
   - Build command : `npm run build`
   - Publish directory : `build`
5. Clique "Deploy site"
6. Attends 2-3 minutes → Netlify te donne une URL type :
   `https://qm-garage-abc123.netlify.app`

---

## ÉTAPE 5 — Installer sur iPhone/iPad 📱
1. Ouvre **Safari** sur ton iPhone (pas Chrome, pas Firefox — Safari uniquement)
2. Va sur ton URL Netlify
3. Appuie sur le bouton **Partager** (carré avec flèche ↑)
4. Fais défiler → appuie sur **"Sur l'écran d'accueil"**
5. Nomme-la "QM Garage" → "Ajouter"
6. ✅ L'icône apparaît sur ton écran d'accueil !

---

## ÉTAPE 6 — Mettre à jour l'app
Si tu veux modifier l'app plus tard :
- Modifie les fichiers sur GitHub (bouton crayon sur chaque fichier)
- Netlify redéploie automatiquement en 2 minutes
- L'app se met à jour toute seule sur ton iPhone

---

## URL personnalisée (optionnel)
Netlify te permet de changer l'URL :
- Site settings → Domain management → "Change site name"
- Ex : `qm-garage.netlify.app`

---

## 💡 Astuce
Pour que tes collègues ou associés puissent aussi l'utiliser :
- Donne-leur simplement l'URL
- Ils font la même manipulation "Sur l'écran d'accueil"
- Chacun a sa propre version sur son téléphone

