# Logging (Foundation 001 §4.2, §5.8)

The structured JSON-lines logger with field allowlist and redaction filter arrives with
capability C8. Until then the application writes nothing but the composition-root startup
lines in `src/app/main.ts`, which carry no configuration values.
