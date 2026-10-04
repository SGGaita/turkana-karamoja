import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button,
  Pagination, ToggleButton, ToggleButtonGroup,
  CircularProgress,
} from '@mui/material';
import ViewListIcon from '@mui/icons-material/ViewList';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import RefreshIcon from '@mui/icons-material/Refresh';
import Layout from '../components/Layout';
import PageHero from '../components/PageHero';
import StaleContentBanner from '../components/StaleContentBanner';
import SkeletonCard from '../components/SkeletonCard';
import ReportCard, { OrgGroupHeader } from '../components/ReportCard';
import ReportPreviewDialog from '../components/ReportPreviewDialog';
import ReportsFilterPanel from '../components/ReportsFilterPanel';
import { getReports } from '../lib/wordpress';
import {
  REPORT_PAGE_SIZE, ORG_GROUP_PAGE_SIZE, groupReportsByOrg, getReportDate,
  applyReportDownloadStats, uniqueLabels,
} from '../lib/report-utils';

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [apiStale, setApiStale] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [search, setSearch] = useState('');
  const [filterOrg, setFilterOrg] = useState('');
  const [filterCategories, setFilterCategories] = useState([]);
  const [filterKeywords, setFilterKeywords] = useState([]);
  const [filterCountries, setFilterCountries] = useState([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState('list');
  const [preview, setPreview] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const { data, apiStale: stale } = await getReports();
      setReports(data || []);
      setApiStale(stale);
    } catch (err) {
      setLoadError(err.message || 'Could not load reports.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDownloadTracked = useCallback((reportId, stats) => {
    setReports((prev) => prev.map((item) => (
      String(item.id) === String(reportId) ? applyReportDownloadStats(item, stats) : item
    )));
    setPreview((current) => (
      current && String(current.report?.id) === String(reportId)
        ? { ...current, report: applyReportDownloadStats(current.report, stats) }
        : current
    ));
  }, []);

  const allOrgs = useMemo(() => {
    const orgs = [];
    reports.forEach((r) => r.orgs?.forEach((o) => orgs.push(o)));
    return uniqueLabels(orgs);
  }, [reports]);

  const allCategories = useMemo(() => {
    const cats = [];
    reports.forEach((r) => (r.categories?.length ? r.categories : [r.tag]).forEach((c) => cats.push(c)));
    return uniqueLabels(cats);
  }, [reports]);

  const allKeywords = useMemo(() => {
    const categoryKeys = new Set(allCategories.map((c) => c.toLowerCase()));
    const keywords = [];
    reports.forEach((r) => r.keywords?.forEach((k) => keywords.push(k)));
    return uniqueLabels(keywords).filter((k) => !categoryKeys.has(k.toLowerCase()));
  }, [reports, allCategories]);

  const filtered = useMemo(() => {
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo) : null;
    if (to) to.setHours(23, 59, 59, 999);

    return reports.filter((r) => {
      const matchSearch = !search
        || r.title?.toLowerCase().includes(search.toLowerCase())
        || r.desc?.toLowerCase().includes(search.toLowerCase())
        || r.keywords?.some((k) => k.toLowerCase().includes(search.toLowerCase()));
      const matchOrg = !filterOrg || r.orgs?.includes(filterOrg);
      const cats = r.categories?.length ? r.categories : [r.tag];
      const matchCat = !filterCategories.length || cats.some((c) => filterCategories.includes(c));
      const matchKeyword = !filterKeywords.length || r.keywords?.some(
        (k) => filterKeywords.some((fk) => fk.toLowerCase() === k.toLowerCase()),
      );
      const matchCountry = !filterCountries.length || r.countries?.some((c) => filterCountries.includes(c));
      const reportDate = getReportDate(r);
      const matchDate = (!from && !to) || (reportDate && (!from || reportDate >= from) && (!to || reportDate <= to));
      return matchSearch && matchOrg && matchCat && matchKeyword && matchCountry && matchDate;
    });
  }, [reports, search, filterOrg, filterCategories, filterKeywords, filterCountries, dateFrom, dateTo]);

  const orgGroups = useMemo(() => groupReportsByOrg(filtered), [filtered]);

  const pageSize = viewMode === 'list' ? REPORT_PAGE_SIZE : ORG_GROUP_PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(
    (viewMode === 'list' ? filtered.length : orgGroups.length) / pageSize,
  ));

  const paginatedReports = useMemo(() => {
    const start = (page - 1) * REPORT_PAGE_SIZE;
    return filtered.slice(start, start + REPORT_PAGE_SIZE);
  }, [filtered, page]);

  const paginatedOrgGroups = useMemo(() => {
    const start = (page - 1) * ORG_GROUP_PAGE_SIZE;
    return orgGroups.slice(start, start + ORG_GROUP_PAGE_SIZE);
  }, [orgGroups, page]);

  const pageStart = filtered.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const pageEnd = viewMode === 'list'
    ? Math.min(page * REPORT_PAGE_SIZE, filtered.length)
    : Math.min(page * ORG_GROUP_PAGE_SIZE, orgGroups.length);

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  const setFilterAndResetPage = (setter, value) => {
    setter(value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setFilterOrg('');
    setFilterCategories([]);
    setFilterKeywords([]);
    setFilterCountries([]);
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  const handleViewModeChange = (_, value) => {
    if (!value) return;
    setViewMode(value);
    setPage(1);
  };

  const handlePageChange = (_, val) => {
    setPage(val);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasActiveFilters = Boolean(
    search || filterOrg || filterCategories.length || filterKeywords.length
      || filterCountries.length || dateFrom || dateTo,
  );

  return (
    <Layout title="Reports & Resources">
      <PageHero
        title="Reports & Resources"
        subtitle="Published situation reports, assessments, and monitoring documents"
        image="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1400&q=70"
        breadcrumbs={['Reports']}
      />

      <Box sx={{ maxWidth: 1300, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 4, md: 6 } }}>
        <StaleContentBanner show={apiStale} />

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, alignItems: 'flex-start' }}>
          <ReportsFilterPanel
            search={search}
            onSearchChange={handleFilterChange(setSearch)}
            onSearchClear={() => setFilterAndResetPage(setSearch, '')}
            categories={allCategories}
            filterCategories={filterCategories}
            onCategoriesChange={(val) => setFilterAndResetPage(setFilterCategories, val)}
            orgs={allOrgs}
            filterOrg={filterOrg}
            onOrgChange={(val) => setFilterAndResetPage(setFilterOrg, val)}
            keywords={allKeywords}
            filterKeywords={filterKeywords}
            onKeywordsChange={(val) => setFilterAndResetPage(setFilterKeywords, val)}
            filterCountries={filterCountries}
            onCountriesChange={(val) => setFilterAndResetPage(setFilterCountries, val)}
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateFromChange={handleFilterChange(setDateFrom)}
            onDateToChange={handleFilterChange(setDateTo)}
            hasActiveFilters={hasActiveFilters}
            onClear={clearFilters}
          />

          {/* Right content column */}
          <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography sx={{ fontSize: '0.82rem', color: '#9A9A9A' }}>
                  {loading ? 'Loading reports…' : (
                    <>
                      Showing <strong style={{ color: '#3D2B1F' }}>{filtered.length}</strong> of{' '}
                      <strong style={{ color: '#3D2B1F' }}>{reports.length}</strong> reports
                      {viewMode === 'by-org' && orgGroups.length > 0 && (
                        <> · <strong style={{ color: '#3D2B1F' }}>{orgGroups.length}</strong> organisations</>
                      )}
                    </>
                  )}
                </Typography>
                {!loading && filtered.length > 0 && (
                  <Typography sx={{ fontSize: '0.72rem', color: '#B0A090', mt: 0.3 }}>
                    {viewMode === 'list'
                      ? `Page ${page} of ${totalPages} · reports ${pageStart}–${pageEnd}`
                      : `Page ${page} of ${totalPages} · organisation groups ${pageStart}–${pageEnd}`}
                  </Typography>
                )}
              </Box>

              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={handleViewModeChange}
                size="small"
                disabled={loading}
                sx={{
                  bgcolor: 'white',
                  border: '1px solid #E8E0D5',
                  borderRadius: 1.5,
                  '& .MuiToggleButton-root': {
                    fontSize: '0.75rem',
                    textTransform: 'none',
                    px: 1.5,
                    py: 0.6,
                    border: 'none',
                    color: '#5A5A5A',
                  },
                  '& .Mui-selected': {
                    bgcolor: '#FDF6EC !important',
                    color: '#C1440E !important',
                    fontWeight: 600,
                  },
                }}
              >
                <ToggleButton value="list">
                  <ViewListIcon sx={{ fontSize: 16, mr: 0.6 }} />
                  List
                </ToggleButton>
                <ToggleButton value="by-org">
                  <AccountTreeIcon sx={{ fontSize: 16, mr: 0.6 }} />
                  By organisation
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress size={28} sx={{ color: '#C1440E' }} />
                </Box>
                {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} height={70} />)}
              </Box>
            ) : loadError ? (
              <Box sx={{ bgcolor: 'white', border: '1px solid #E8E0D5', borderRadius: 2, p: 5, textAlign: 'center' }}>
                <Typography sx={{ color: '#B91C1C', fontSize: '0.9rem', mb: 2 }}>{loadError}</Typography>
                <Button size="small" onClick={load} startIcon={<RefreshIcon />} sx={{ color: '#C1440E', textTransform: 'none' }}>Try again</Button>
              </Box>
            ) : filtered.length === 0 ? (
              <Box sx={{ bgcolor: 'white', border: '1px solid #E8E0D5', borderRadius: 2, p: 5, textAlign: 'center' }}>
                <Typography sx={{ color: '#9A9A9A', fontSize: '0.9rem', mb: 1 }}>No reports found matching your filters.</Typography>
                <Button size="small" onClick={clearFilters} sx={{ color: '#C1440E', textTransform: 'none' }}>Clear filters</Button>
              </Box>
            ) : viewMode === 'list' ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
                {paginatedReports.map((r) => (
                  <ReportCard key={r.id || r.title} report={r} onPreview={(report, file) => setPreview({ report, file })} onDownloadTracked={handleDownloadTracked} />
                ))}
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, mb: 4 }}>
                {paginatedOrgGroups.map((group) => (
                  <Box key={group.name}>
                    <OrgGroupHeader group={group} />
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pl: { xs: 0, md: 1 } }}>
                      {group.items.map((r) => (
                        <ReportCard key={r.id || `${group.name}-${r.title}`} report={r} onPreview={(report, file) => setPreview({ report, file })} onDownloadTracked={handleDownloadTracked} compact />
                      ))}
                    </Box>
                  </Box>
                ))}
              </Box>
            )}

            {!loading && filtered.length > 0 && totalPages > 1 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, mt: 2, mb: 4 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  shape="rounded"
                  color="primary"
                  showFirstButton
                  showLastButton
                  sx={{
                    '& .MuiPaginationItem-root': { fontFamily: '"Montserrat", sans-serif', fontSize: '0.82rem' },
                    '& .MuiPaginationItem-root.Mui-selected': { bgcolor: '#C1440E', color: 'white', '&:hover': { bgcolor: '#A33A0C' } },
                  }}
                />
                <Typography sx={{ fontSize: '0.72rem', color: '#9A9A9A' }}>
                  {viewMode === 'list'
                    ? `${REPORT_PAGE_SIZE} reports per page`
                    : `${ORG_GROUP_PAGE_SIZE} organisation groups per page`}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      <ReportPreviewDialog
        report={preview?.report}
        file={preview?.file}
        open={Boolean(preview)}
        onClose={() => setPreview(null)}
        onDownloadTracked={handleDownloadTracked}
      />
    </Layout>
  );
}
