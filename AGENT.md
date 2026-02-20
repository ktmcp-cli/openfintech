# OpenFinTech CLI - Agent Instructions

This CLI provides access to the OpenFinTech.io database of standardized FinTech industry data.

## Common Tasks

**List currencies:**
```bash
openfintech currencies list
```

**Get currency details:**
```bash
openfintech currencies get USD
```

**Search banks:**
```bash
openfintech banks list --search "Bank of America"
```

**List countries:**
```bash
openfintech countries list
```

**Get payment methods:**
```bash
openfintech payment-methods list
```

## Output Modes

- Default: Human-readable tables
- `--json`: Machine-readable JSON output

## Notes

- No authentication required - OpenFinTech.io is an open database
- All data is read-only
- Perfect for FinTech development and integration work
