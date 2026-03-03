# Character Spending Analysis

All ways that characters can spend (lose) money in **Gaming the Great Plague**. Money is tracked in pence via the `$money` variable (12d = 1s, 240d = £1).

---

## 1. Monthly Living Expenses (Automatic, Recurring)

Every month, the `<<expenses>>` and `<<disposable>>` widgets (pid 77) deduct living costs from `$money`. When expenses exceed income, the net effect is a loss.

| Social Class | Monthly Expenses | Converted |
|---|---|---|
| Beggars | 114d | 9s 6d |
| Day labourers | 240d | £1 |
| Servants | 220d | 18s 4d |
| Artisans | 560d | £2 6s 8d |
| Merchants | 2,800d | £11 13s 4d |
| Nobles | 12,800d | £53 6s 8d |

---

## 2. Bills of Mortality Subscription (Optional, Recurring)

- **Cost:** 4d per month
- **Source:** pid 114 (`Claude-widgets`), `<<corpse-work>>` widget
- **Condition:** Player subscribes starting May 1665 (`$billSubscribed is 1`). Automatically cancelled if the player enters debt.

---

## 3. Church of England Non-Attendance Fines (Recurring, Non-CoE Only)

- **Cost:** 48d (4s) per month
- **Source:** pid 115 (`june-1665-helper-widget`), `<<church-services>>` widget
- **Condition:** Non-Church of England characters (Catholic, Presbyterian, Baptist, Quaker) who skip weekly parish services. Players can choose to always skip, skip one month, or attend. Forced to attend (no fine) if in debt. Not charged in April 1666 (Easter has its own rules).

---

## 4. Easter Costs — April 1666

**a) Communion offering**
- **Cost:** 2d
- **Condition:** CoE members who attend and take communion (age 16+)

**b) Non-attendance fine**
- **Cost:** 4,800d (£20)
- **Condition:** Player skips Easter AND reputation < 6

**c) Skipping communion fine**
- **Cost:** 4,800d (£20)
- **Condition:** Player attends Easter but refuses communion AND reputation < 6

**Source:** pid 26 (`April 1666`)

---

## 5. Christmas Feast (Optional, December 1664 & December 1665)

Player chooses whether to celebrate Christmas with a feast. Cost varies by class via the `<<party-costs>>` widget (pid 114).

| Social Class | Cost | Converted |
|---|---|---|
| Nobles | 2,400d | £10 |
| Merchants | 480d | £2 |
| Artisans | 120d | 10s |
| Others | 6d | 6d |

**Source:** pid 12 (`december-1664-helper widget`), pid 22 (`December 1665`)

---

## 6. January 1665 — One-Time Spending Choices

Optional choices that vary by social class and gender:

| Choice | Cost | Who |
|---|---|---|
| Donate to the poor | 120d (10s) | Day labourers (female) |
| Trip to the theatre | 120d (10s) | Day labourers (female) |
| Donate to the poor | 560d (£2 6s 8d) | Artisans |
| Trip to the theatre | 132d (11s) | Artisans |
| Donate to the poor | 2,800d (£11 13s 4d) | Merchants |
| Help with the war effort | 10,000d (£41 13s 4d) | Nobles |

**Source:** pid 9 (`January 1665`)

---

## 7. Fleeing the City (One-Time)

Flight costs from pid 64 (`flight-choice`) via the `<<flee-choice>>` widget:

| Choice | Cost | Who |
|---|---|---|
| Flee (return to origin) | 0d | Day labourers/beggars from outside London |
| Send household away | 560d (£2 6s 8d) | Artisans |
| Flee with entire household | 1,120d (£4 13s 4d) | Artisans |
| Join household already sent away | 560d (£2 6s 8d) | Artisans |
| Send household away | 800d (£3 6s 8d) | Merchants |
| Flee with entire household | 1,600d (£6 13s 4d) | Merchants |
| Send most of household away | 5,000d (£20 16s 8d) | Nobles |
| Flee with entire household | 10,000d (£41 13s 4d) | Nobles |

---

## 8. Monthly Costs While Fled (Recurring While Away)

Each month the player is away from London, they incur ongoing costs via `<<fled-cost>>` and `<<fled-opening>>` widgets (pid 115). If money runs out, the `<<fled-broke>>` widget forces the player to return.

| Social Class | Monthly Cost While Fled | Converted |
|---|---|---|
| Beggars | 120d | 10s |
| Day labourers | 300d | £1 5s |
| Artisans | 800d | £3 6s 8d |
| Merchants | 2,800d | £11 13s 4d |
| Servants | 0d | — |
| Nobles | 0d | — |

---

## 9. Funerals

From pid 13 (`NPC-funeral widget`) and pid 39 (`FamPesthouse`):

**a) Quick burial**
- **Cost:** 9d
- **Condition:** Available to all. The cheaper option for any dead NPC.

**b) Proper funeral** (varies by class)

| Social Class | Cost | Converted |
|---|---|---|
| Nobles | 4,800d | £20 |
| Merchants | 960d | £4 |
| Artisans | 240d | £1 |
| Others | 12d | 1s |

- **Note:** Proper funerals carry a 2% plague infection risk from attendance.

**c) Pesthouse admission fee**
- **Cost:** 5d (flat fee for sending sick family to the pesthouse)
- **Additional:** 9d automatic quick burial per NPC who dies in the pesthouse
- **Source:** pid 39 (`FamPesthouse`)

---

## 10. Steward Events (Nobles Only)

From pid 93 (`steward`):

**a) Hold funeral for steward**
- **Cost:** 4,800d (£20)
- **Condition:** Player answers "Yes" (fond of steward)

**b) Estate management costs**
- **Cost:** 9d (administrative cost via `<<storyline-return>>`)
- **Condition:** Player answers "No" (not fond of steward)

---

## 11. Wedding Costs

Three options from pid 108 (`wedding`):

**a) Parish church wedding**
- **Cost:** 48d (4s) + party costs (via `<<party-costs>>`)
- **Total:** 2,448d (nobles), 528d (merchants), 168d (artisans), 54d (others)
- **Plague risk:** 6.6%

**b) Private wedding license**
- **Cost:** 96d (8s), no party
- **Plague risk:** 3.3%

**c) Elope at Fleet Prison**
- **Cost:** 72d (6s), no party
- **Plague risk:** 3.3%; also −2 reputation

---

## 12. Childbirth Costs

From pid 111 (`birth`):

**a) Stillborn burial**
- **Cost:** 9d
- **Condition:** 25% chance of stillbirth

**b) Birth celebration party** (via `<<party-costs>>`)

| Social Class | Cost | Converted |
|---|---|---|
| Nobles | 2,400d | £10 |
| Merchants | 480d | £2 |
| Artisans | 120d | 10s |
| Others | 6d | 6d |

- **Plague risk:** 2%

**c) Quick baptism**
- **Cost:** 6d
- **Condition:** Alternative to celebration party

---

## 13. Apothecary Purchases — Preventatives & Fumigants

From pid 79 (`Apothecary`). Preventative prices scale by household size; fumigant prices are mostly flat.

### Preventative Medicines

| Item | Cost Formula | Per Person |
|---|---|---|
| Celestial Water | household size × 36d | 36d (3s) |
| London Treacle (preventative) | household size × 6d | 6d |

### Fumigants

| Item | Cost | Notes |
|---|---|---|
| Purse of Incense | household size × 60d | 60d (5s) per person |
| St. Giles Powder | 192d (16s) | Flat price |
| Cheap Fumigants (brimstone & saltpeter) | 24d (2s) | Flat price |

---

## 14. Plague Treatment Purchases (During Illness)

From pid 80 (`preventatives-treatments`). Purchased at point-of-use if the player doesn't have the remedy in stock.

### For the Player

| Treatment | Cost | Notes |
|---|---|---|
| Hiring a nurse | 12d (1s) | Only if player has no household members. Parish Overseers pay if player can't afford (−1 reputation). |
| Blistering plaster | 441d (£1 16s 9d) | 21d × 21 units |
| Cordial tincture | 48d (4s) | 12d × 4 units |
| London Treacle (treatment) | 576d (£2 8s) | 36d × 16 units |

### For Household Members (per infected person)

| Treatment | Cost per Infected | Notes |
|---|---|---|
| Blistering plaster | 441d (£1 16s 9d) | 21d × 21 units per person |
| Cordial tincture | 48d (4s) | 12d × 4 units per person |
| London Treacle (treatment) | 576d (£2 8s) | 36d × 16 units per person |

---

## 15. Breaking Curfew — August 1665

- **Cost:** 10d
- **Source:** pid 18 (`August 1665`)
- **Condition:** Player chooses "No, I need to know more" (breaks curfew to seek news). Also costs −2 reputation and carries 12.5% plague infection risk.

---

## 16. Work Accident

- **Cost:** 3d
- **Source:** pid 97 (`accident`)
- **Condition:** Player survives the accident (non-fatal outcome). Represents lost wages during recovery. Primarily affects day labourers and servants.

---

## 17. Fever

- **Cost:** 2d
- **Source:** pid 101 (`fever`)
- **Condition:** Player survives a non-plague fever. Represents lost wages/expenses during illness.

---

## 18. Run Over by Cart (Beggars, Low Reputation)

- **Cost:** 1d
- **Source:** pid 100 (`runover`)
- **Condition:** Beggar class, survives, AND reputation ≤ 1. (If reputation > 1, the player actually gains 2d instead.)

---

## 19. Declining a Parish Office

- **Cost:** 24d (2s)
- **Source:** pid 114 (`Claude-widgets`), `<<hold-office>>` widget
- **Condition:** CoE males, age 30+, reputation 8+, artisan or merchant class. Player is offered Churchwarden or Overseer of the Poor and declines.

---

## 20. Taking in Dependents

From pid 105 (`add-dependent widget`):

**a) Worker's child or apprentice**
- **Cost:** 48d (4s)
- **Condition:** Day labourers/servants (worker's child) or artisans (apprentice). Player accepts a friend's child.

**b) Ward (nobles only)**
- **Cost:** 12,000d (£50)
- **Condition:** Noble player accepts a friend's child as a ward to outfit for court.

---

## 21. Banishment Recovery (Nobles Only)

From pid 43 (`banished`):

**a) Help the King find his next mistress**
- **Cost:** 12,800d (£53 6s 8d)
- **Additional:** −1 reputation

**b) Fund the war effort**
- **Cost:** 25,600d (£106 13s 4d)
- **Additional:** +1 reputation

---

## Summary Table

| # | Category | Min Cost | Max Cost | Who Can Be Affected |
|---|---|---|---|---|
| 1 | Monthly living expenses | 114d/mo | 12,800d/mo | All (automatic) |
| 2 | Bills of Mortality subscription | 4d/mo | 4d/mo | All (optional) |
| 3 | Church service fines | 48d/mo | 48d/mo | Non-CoE only |
| 4 | Easter costs | 2d | 4,800d | All (April 1666) |
| 5 | Christmas feast | 6d | 2,400d | All (optional) |
| 6 | January 1665 choices | 120d | 10,000d | Class-specific |
| 7 | Fleeing the city | 0d | 10,000d | Class-specific |
| 8 | Monthly cost while fled | 0d | 2,800d/mo | Class-specific |
| 9 | Funerals | 5d | 4,800d | All |
| 10 | Steward events | 9d | 4,800d | Nobles only |
| 11 | Weddings | 54d | 2,448d | All (if eligible) |
| 12 | Childbirth | 6d | 2,400d | Female characters |
| 13 | Apothecary (preventatives/fumigants) | 24d | varies by household | All (optional) |
| 14 | Plague treatments | 12d | 576d+ per person | All (if sick) |
| 15 | Breaking curfew | 10d | 10d | All (Aug 1665) |
| 16 | Work accident | 3d | 3d | Day labourers/servants |
| 17 | Fever | 2d | 2d | All |
| 18 | Run over by cart | 1d | 1d | Beggars (low rep) |
| 19 | Declining parish office | 24d | 24d | CoE males, 30+, rep 8+ |
| 20 | Taking in dependents | 48d | 12,000d | Class-specific |
| 21 | Banishment recovery | 12,800d | 25,600d | Nobles only |
