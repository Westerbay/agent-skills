# Organisation React / TypeScript

## Découpage d’une feature

Choisir une structure proportionnée. Exemple pour une liste paginée qui possède
requête, navigation, colonnes et plusieurs états d’affichage :

```text
features/users/
  users.config.ts
  hooks/
    use-users.ts                 Requête et paramètres de cache
    use-users-table.ts           Navigation, retry et modèle de table
  components/
    users-table.tsx              Composition de la section
    users-table.columns.ts       Définition des colonnes et callbacks de cellule
    users-table-content.tsx      Rendu du tableau et de son état vide
    users-table-pagination.tsx   Boutons et annonce de la page
    users-table-feedback.tsx     Chargement et erreur
```

Ces noms illustrent des responsabilités ; ne pas recopier cette arborescence
pour une simple liste statique. Extraire un mécanisme générique seulement si sa
réutilisation apporte un bénéfice concret et respecte les modules du projet.

## Handlers avant le JSX

```tsx
function Navigation({ pending, onNextPage }: NavigationProps) {
  return <Button disabled={pending} onClick={onNextPage}>Suivant</Button>
}
```

Le hook ou composant qui possède l’état définit le comportement nommé :

```tsx
async function handleNextPage() {
  if (!canGoNext) return
  if (hasCachedNextPage) {
    setPageIndex(pageIndex + 1)
    return
  }
  await loadNextPage(pageIndex + 1)
}
```

Éviter `onClick={() => void handleNextPage()}` lorsqu’une référence directe suffit.
Traiter les erreurs dans l’orchestration ou dans le mécanisme de requête choisi.
Le type d’un callback asynchrone doit refléter sa promesse si les consommateurs
ont besoin de l’attendre. Ne pas ajouter `useCallback` automatiquement : stabiliser
les références seulement lorsqu’un consommateur ou une mesure le justifie.

## Options typées sans assertion

Exprimer explicitement les génériques lorsque l’inférence réduit trop un type :

```ts
function getNextPageCursor<T>(page: CursorPage<T>): string | undefined {
  return page.nextCursor ?? undefined
}

return infiniteQueryOptions<
  CursorPage<T>, Error, TData, QueryKey, string | undefined
>({
  ...options,
  initialPageParam: undefined,
  getNextPageParam: getNextPageCursor<T>,
})
```

Le type `CursorPage`, les limites de page et le schéma de réponse appartiennent
au contrat partagé. Le wrapper doit conserver les options natives utiles,
comme `select`, `enabled` et `staleTime`. Valider les données non fiables avant
leur utilisation ; le typage seul ne valide pas une réponse externe.

## État, cache et navigation

- Dériver les lignes et disponibilités des actions depuis les pages reçues.
  Stocker seulement l’état d’interaction nécessaire, comme la page demandée.
- Garder des colonnes et un tableau vide stables si la bibliothèque de table
  dépend de leur identité ; ne pas ajouter une mémorisation partout.
- Utiliser le même ordre unique dans le prédicat de curseur et dans la requête.
  `limit + 1` permet de détecter la page suivante sans compter toute la liste.
- Inclure taille, filtres et contexte pertinent dans la clé de query. Transmettre
  le signal d’annulation au client HTTP et respecter la purge du cache privé.
- Ne pas avancer la page affichée quand le chargement échoue. Conserver les lignes
  déjà disponibles. Un retry doit charger la page échouée même si l’utilisateur
  est revenu entre-temps à une page antérieure.
- Garder les éléments HTML sémantiques, labels, annonces de chargement et navigation
  clavier. Le découpage ne doit pas dégrader l’accessibilité ou le rendu mobile.

## Validation utile

Adapter les tests existants pour vérifier : première/dernière page, retour sans
requête inutile, erreur suivie de retry, retry après navigation arrière,
conservation des options génériques et changement des paramètres de cache.
Utiliser une base de test possédée et isolée pour les tests de persistance.
Une extraction de composant pure ne demande pas un test qui duplique son JSX.
