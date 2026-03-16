`LoadingStep` supports three reusable modes:

- `inline`: render a loading card inside normal layout flow.
- `overlay`: wrap any section and block that area while keeping content visible underneath.
- `page`: block the full viewport for login/auth or other global loading states.

Example:

```tsx
<LoadingStep
  isLoading={isSaving}
  variant="overlay"
  title="Guardando cambios"
  description="Sincronizando la información con la base de datos."
  currentStep="Persistiendo registros"
  steps={[
    { label: "Validar", status: "completed" },
    { label: "Guardar", status: "active" },
    { label: "Finalizar", status: "pending" },
  ]}
>
  <YourSection />
</LoadingStep>
```
