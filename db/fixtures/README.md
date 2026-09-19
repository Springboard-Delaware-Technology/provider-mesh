# Synthetic fixtures (Foundation 001 §5.9)

A deterministic generator from a seed and an environment guard arrive with C9. No field is ever copied, transformed, or "anonymized" from a real record (`SEC-DEV-01`); the loader refuses any database whose `mesh_instance.environment` is not `development` or `ci`.
