# Issue #22: Plague Immunity Analysis

## Summary
**Status:** VERIFIED - No bug found
**Conclusion:** Characters with "recovered" status cannot be reinfected with plague.

## Analysis

### Objective
Analyze the infection code to verify that characters with "recovered" status cannot be reinfected with plague. If reinfection is possible, implement a patch to prevent this behavior.

### Methodology
1. Extracted all passages from `GamingtheGreatPlague.html` using `extract.js`
2. Analyzed all infection-related passages (tagged with "infection-rates")
3. Examined all code paths that set character health status to "infected"
4. Verified health status transitions and checked for any reset conditions

### Findings

#### Infection Logic Implementation
All infection code consistently follows this pattern across all location-based infection passages:

```twine
<<for _i = 0; _i < $NPCs.length; _i++>>
    <<if $NPCs[_i].health is "healthy">>
        <<if random(1,X) lte 1>><<set $NPCs[_i].health to "infected">>
        <</if>>
    <</if>>
<</for>>
```

**Key passages verified:**
- `inside-city` (pid: 7)
- `Westminster-infection` (pid: 8)
- `Western-infection` (pid: 12)
- `eastern-infection` (pid: 13)
- `northern-infection` (pid: 35)
- `southern-infection` (pid: 36)

#### Health Status Values
Characters in the game can have the following health statuses:
- `"healthy"` - Never been infected
- `"infected"` - Currently infected with plague
- `"recovered"` - Survived plague infection
- `"recovered-pq"` - Recovered post-quarantine
- `"recovered1"`, `"recovered2"`, `"recovered3"`, `"recovered4"` - Various recovery states
- `"deceased"` - Died from plague or other causes

#### Immunity Mechanism
1. **Infection Check:** All infection code paths check `if health is "healthy"` before allowing infection
2. **Recovery Assignment:** Characters who survive plague are assigned "recovered" status (or variants)
3. **No Status Reset:** No code path resets "recovered" status back to "healthy"
4. **Result:** Characters with any "recovered" status variant cannot be infected because they are never "healthy" again

### Conclusion

**Plague immunity is already correctly implemented in the game.**

The infection system prevents reinfection through its health status checking mechanism. Only characters with "healthy" status can be infected, and once a character recovers from plague, they permanently retain a "recovered" status variant and are never reset to "healthy".

**No code changes are required.**

### Technical Details

The immunity is enforced at the source through the conditional check:
- Condition: `health is "healthy"`
- Implication: Only never-infected characters can be infected
- Protection: Recovered characters (with any "recovered*" status) are excluded from infection

This is a robust implementation that doesn't require explicit immunity flags or additional checks.

---

**Analysis Date:** 2026-02-14
**Analyzed By:** Claude (AI Assistant)
**Files Examined:** `GamingtheGreatPlague.html`, `passages.json` (extracted)
