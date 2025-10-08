# Transcript Summary - Cohort Analytics Dashboard Feedback
**Meeting:** Jac, Carlos, Greg
**Date:** [From transcript]
**Duration:** ~20 minutes
**Topic:** Cohort Analytics Dashboard Prototype Review

---

## 🎯 Key Takeaways

### 1. **Trust is the #1 Priority**
> "The issue with the org's data historically has been lack of trust" - Jac

**Implication:** Before building more features, we MUST:
- Hold metric definition sessions with the team
- Validate every metric calculation
- Get team consensus on what each metric means
- Show transparency in how AI generates queries

### 2. **Hybrid Approach is the Solution**
Team wants **three types of interactions**:

1. **Natural Language Queries** (what you built)
   - Ad-hoc questions
   - Exploratory analysis
   - One-off reports

2. **Static KPI Dashboard** (Phase 2)
   - Daily operational view
   - Consistent layout for pattern recognition
   - Quick outlier detection

3. **Proactive Insights** (Phase 2)
   - AI auto-detects problems
   - "Here's what needs attention"
   - Recommended actions

### 3. **No Iframes - Integration is Critical**
> "If we want to white label this, it has to be one package" - Greg

**Decision:** Build as React components inside main tool
- Follow Carlos's development standards
- Share authentication
- Maintain consistency with tool UI/UX
- Avoid maintenance nightmare of separate apps

### 4. **MVP = Top 10 Validated Metrics Only**
Don't build everything. Focus on:
- Attendance
- Task completion (interaction-based for now)
- Grades (from BigQuery)
- Plus 7 others TBD in metric sessions

**Why:** Get core metrics trustworthy before expanding

### 5. **BigQuery Worth Exploring**
- Built for analytics queries
- Less harsh joins than Postgres
- Already contains assessment/grades data
- Need to compare performance/cost

---

## ✅ Approvals & Next Steps

### Required Before Development
1. **Dave's Approval** → Present PRD in Wednesday meeting
2. **Joanna's Sign-off** → Data outputs and metric definitions
3. **Metric Definition Sessions** → Team alignment on calculations
4. **BigQuery Evaluation** → Postgres vs BigQuery decision

### Immediate Actions
1. ✅ Create simple PRD (done - see `PRD-Cohort-Analytics-Dashboard.md`)
2. Share PRD with Jac & Carlos
3. Schedule Wednesday meeting with Dave
4. Get Carlos's development standards document
5. Schedule metric definition sessions (Jac coordinating)
6. Compare Postgres vs BigQuery implementations

---

## 🔧 Technical Decisions

### Architecture Changes Needed
| Current | Future |
|---------|--------|
| Standalone prototype | Integrated React components |
| Direct Postgres | Evaluate BigQuery |
| No schema context | Full schema + keyword mapping |
| Iframe deployment | Built into main tool |

### Schema Context Enhancement
AI needs better context:
```javascript
// Example keyword mapping
{
  "submissions": "submissions.created_at field",
  "completed task": "interaction check, not quality",
  "attendance": "attendance.status = 'present'",
  "grades": "assessment_feedback from BigQuery"
}
```

---

## 💡 Feature Feedback

### What's Working Well
✅ Natural language query interface
✅ Drill-down concept (click to see details)
✅ Builder profile views
✅ Clean visualizations

### What Needs Work
⚠️ Task click-through is broken
⚠️ Completion = interaction (need quality metrics)
⚠️ No educational tooltips yet
⚠️ Missing proactive insights
⚠️ No static dashboard option

### What to Add (MVP)
1. **Educational Components**
   - Tooltips explaining calculations
   - Grading rubric interpretation guide
   - "How is this calculated?" sections

2. **Better Drill-Down**
   - Fix task details click-through
   - Add breadcrumb navigation
   - Enable shareable URLs

3. **Transparency Features**
   - Show SQL query (optional)
   - Data freshness indicator
   - "Did this answer your question?" feedback

---

## 📊 Metric Definitions (From Discussion)

### Current Understanding
| Metric | Current Definition | Issues |
|--------|-------------------|--------|
| Attendance | Check-in status | ✅ Straightforward |
| Task Completion | Any interaction | ⚠️ Not quality-based |
| Grades | From BigQuery | ⚠️ Need interpretation guide |
| Struggling Builders | TBD | ❌ Criteria undefined |
| Top Performers | TBD | ❌ Criteria undefined |

### Questions to Answer in Metric Sessions
- How do we define "struggling builder" quantitatively?
- What makes someone a "top performer"?
- Should completion consider quality or just interaction?
- How do we weight different task types?
- What's the threshold for intervention?

---

## 🎓 User Experience Insights

### User Mental Model
> "The ability to drill down is always the follow up question for anyone" - Greg

**Pattern:**
1. User sees high-level metric
2. User asks "What does this mean?"
3. User wants to see individual details
4. User wants to understand context

**Design Implication:** Every visualization must be clickable and lead to explanatory detail.

### Educational Needs
> "I think there's also like an educational component to this" - Greg

**Users need to understand:**
- How metrics are calculated
- How to interpret grades
- What actions to take based on insights
- Why certain builders are flagged

---

## 🚧 Known Challenges

### Data Quality
- **March cohort**: Messy data ❌
- **June cohort**: Not great ⚠️
- **September cohort**: Pretty good ✅

**Decision:** MVP focuses on September only

### Metric Definition Complexity
> "Those sessions could be kind of painful, but like, are very needed" - Jac

**Reality:** Defining metrics is hard but critical for trust
- Expect multiple iterations
- Document all decisions
- Version control definitions
- Get sign-off from stakeholders

### AI Query Interpretation
Current challenges:
- Doesn't always understand nuanced questions
- May use wrong database fields
- Needs better schema context
- Requires keyword mapping

**Solution:** Enhanced prompts with full context

---

## 📈 Success Metrics (Implied from Discussion)

### Adoption
- Team uses it weekly for operations
- Replaces manual report requests
- Becomes "source of truth" for metrics

### Trust
- Metrics match manual calculations
- Team has confidence in outputs
- No more "I don't trust that number" pushback

### Efficiency
- Questions answered in seconds (not hours)
- Reduces Jac/Joanna manual reporting time
- Enables data-driven decision making

---

## 🔮 Future Vision (Phase 2+)

### Cross-Cohort Comparisons
> "Huge value in having comparisons across cohorts and across time" - Jac

- September vs June vs March (when data clean)
- Identify program improvements over time
- Benchmark new cohorts against historical

### Proactive Insights
Jac's idea:
- AI analyzes data automatically
- Identifies outliers and patterns
- Surfaces "here's what you should act on"
- Recommends interventions

### White-Label Version
> "If we want to white label this, it has to be one package" - Greg

- External partners can use for their cohorts
- Requires clean, integrated architecture
- No iframes or separate deployments

---

## 🎯 Priority Order

### P0 (Must Have for MVP)
1. Metric definition sessions
2. Top 10 metrics validated
3. React component integration
4. Educational tooltips
5. Working drill-down on all elements

### P1 (Nice to Have for MVP)
1. BigQuery migration (if performance gain)
2. SQL query transparency
3. Shareable URLs
4. Export functionality

### P2 (Phase 2)
1. Static KPI dashboard
2. Proactive insights panel
3. Cross-cohort comparisons
4. Automated alerting

---

## 💬 Memorable Quotes

> "I think the best thing we should do is have real metric definition sessions and take the time to define how we want these things started" - Jac

> "The issue with the org's data historically has been lack of trust" - Jac

> "The ability to drill down is always the follow up question for anyone" - Greg

> "Everything has to be one package if we want to white label this" - Greg

> "I think there's also like an educational component to this for anyone who's stepping into it" - Greg

> "I do think a third part of that is kind of proactive... it already analyzed the data, it found these insights. Here's what you should act on." - Jac

---

## 📝 Action Items Assigned

### Greg
- [x] Create PRD
- [ ] Present to Dave (Wednesday)
- [ ] Meet with Joanna for data sign-off
- [ ] Evaluate Postgres vs BigQuery
- [ ] Get Carlos's dev standards doc
- [ ] Continue iterating prototype

### Jac
- [ ] Schedule metric definition sessions
- [ ] Provide BigQuery credentials
- [ ] Coordinate team validation
- [ ] Define QDR alignment needs

### Carlos
- [ ] Share development standards document
- [ ] Review PRD technical feasibility
- [ ] Support BigQuery evaluation
- [ ] Guide React integration approach

### Team (Metric Sessions)
- [ ] Define top 10 metrics with clear calculations
- [ ] Agree on "struggling builder" criteria
- [ ] Agree on "top performer" criteria
- [ ] Create keyword mapping document
- [ ] Document excluded users rationale

---

**Next Milestone:** Wednesday meeting with Dave for PRD approval

**Critical Path:** Metric definition sessions → Everything else depends on this
