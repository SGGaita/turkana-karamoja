import { useState, useMemo } from 'react';
import { Box, Typography, Button, Chip, TextField, MenuItem, Select, FormControl, InputLabel, Pagination, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import Layout from '../components/Layout';
import PageHero from '../components/PageHero';
import StaleContentBanner from '../components/StaleContentBanner';
import { fallbackReports } from '../lib/fallback-data';
import { getReports } from '../lib/wordpress';

const PAGE_SIZE = 5;

export default function Reports({ reports, apiStale }) {
  const [search, setSearch] = useState('');
  const [filterOrg, setFilterOrg] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [page, setPage] = useState(1);

  const allOrgs = useMemo(() => {
    const orgs = new Set();
    reports.forEach((r) => r.orgs?.forEach((o) => orgs.add(o)));
    return Array.from(orgs).sort();
  }, [reports]);

  const allCategories = useMemo(() => {
    return Array.from(new Set(reports.map((r) => r.tag).filter(Boolean))).sort();
  }, [reports]);

  const allYears = useMemo(() => {
    return Array.from(new Set(reports.map((r) => r.date?.slice(-4)).filter(Boolean))).sort((a, b) => b - a);
  }, [reports]);

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      const matchSearch = !search || r.title?.toLowerCase().includes(search.toLowerCase()) || r.desc?.toLowerCase().includes(search.toLowerCase());
      const matchOrg = !filterOrg || r.orgs?.includes(filterOrg);
      const matchCat = !filterCategory || r.tag === filterCategory;
      const matchYear = !filterYear || r.date?.includes(filterYear);
      return matchSearch && matchOrg && matchCat && matchYear;
    });
  }, [reports, search, filterOrg, filterCategory, filterYear]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setFilterOrg('');
    setFilterCategory('');
    setFilterYear('');
    setPage(1);
  };

  const hasActiveFilters = search || filterOrg || filterCategory || filterYear;

  const selectSx = {
    bgcolor: 'white',
    fontSize: '0.82rem',
    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E8E0D5' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#D4A96A' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2E7BB4' },
  };

  return (
    <Layout title="Reports & Resources">
      <PageHero title="Reports & Resources" subtitle="Published situation reports, assessments, and monitoring documents" image="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1400&q=70" breadcrumbs={['Reports']} />

      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 4, md: 6 } }}>
        <StaleContentBanner show={apiStale} />

        {/* Filters */}
        <Box sx={{ bgcolor: 'white', border: '1px solid #E8E0D5', borderRadius: 2, p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#3D2B1F' }}>Filter Reports</Typography>
            {hasActiveFilters && (
              <Button size="small" onClick={clearFilters} startIcon={<CloseIcon />} sx={{ color: '#C1440E', fontSize: '0.75rem', textTransform: 'none' }}>
                Clear all filters
              </Button>
            )}
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <TextField
              placeholder="Search by title or keyword..."
              value={search}
              onChange={handleFilterChange(setSearch)}
              size="small"
              sx={{ flex: '2 1 240px', bgcolor: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E8E0D5' } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 18, color: '#9A9A9A' }} />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl size="small" sx={{ flex: '1 1 160px' }}>
              <InputLabel sx={{ fontSize: '0.82rem' }}>Category</InputLabel>
              <Select value={filterCategory} onChange={handleFilterChange(setFilterCategory)} label="Category" sx={selectSx}>
                <MenuItem value=""><em>All Categories</em></MenuItem>
                {allCategories.map((c) => <MenuItem key={c} value={c} sx={{ fontSize: '0.82rem' }}>{c}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ flex: '1 1 160px' }}>
              <InputLabel sx={{ fontSize: '0.82rem' }}>Organisation</InputLabel>
              <Select value={filterOrg} onChange={handleFilterChange(setFilterOrg)} label="Organisation" sx={selectSx}>
                <MenuItem value=""><em>All Organisations</em></MenuItem>
                {allOrgs.map((o) => <MenuItem key={o} value={o} sx={{ fontSize: '0.82rem' }}>{o}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ flex: '1 1 120px' }}>
              <InputLabel sx={{ fontSize: '0.82rem' }}>Year</InputLabel>
              <Select value={filterYear} onChange={handleFilterChange(setFilterYear)} label="Year" sx={selectSx}>
                <MenuItem value=""><em>All Years</em></MenuItem>
                {allYears.map((y) => <MenuItem key={y} value={y} sx={{ fontSize: '0.82rem' }}>{y}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Results summary */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Typography sx={{ fontSize: '0.82rem', color: '#9A9A9A' }}>
            Showing <strong style={{ color: '#3D2B1F' }}>{filtered.length}</strong> of <strong style={{ color: '#3D2B1F' }}>{reports.length}</strong> reports
          </Typography>
          {hasActiveFilters && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {filterCategory && <Chip label={filterCategory} onDelete={() => { setFilterCategory(''); setPage(1); }} size="small" sx={{ bgcolor: '#E0EFF8', color: '#2E7BB4', fontSize: '0.7rem' }} />}
              {filterOrg && <Chip label={filterOrg} onDelete={() => { setFilterOrg(''); setPage(1); }} size="small" sx={{ bgcolor: '#FDF6EC', color: '#C1440E', fontSize: '0.7rem' }} />}
              {filterYear && <Chip label={filterYear} onDelete={() => { setFilterYear(''); setPage(1); }} size="small" sx={{ bgcolor: '#F0FFF6', color: '#2E8B57', fontSize: '0.7rem' }} />}
              {search && <Chip label={`"${search}"`} onDelete={() => { setSearch(''); setPage(1); }} size="small" sx={{ bgcolor: '#F5F5F5', color: '#5A5A5A', fontSize: '0.7rem' }} />}
            </Box>
          )}
        </Box>

        {/* Report list */}
        {paginated.length === 0 ? (
          <Box sx={{ bgcolor: 'white', border: '1px solid #E8E0D5', borderRadius: 2, p: 5, textAlign: 'center' }}>
            <Typography sx={{ color: '#9A9A9A', fontSize: '0.9rem', mb: 1 }}>No reports found matching your filters.</Typography>
            <Button size="small" onClick={clearFilters} sx={{ color: '#C1440E', textTransform: 'none' }}>Clear filters</Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
            {paginated.map((r) => (
              <Box key={r.id || r.title} sx={{ bgcolor: 'white', border: '1px solid #E8E0D5', borderRadius: 2, p: 2.5, transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 4px 16px rgba(61,43,31,0.08)' } }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mb: 0.8 }}>
                  <Chip label={r.tag} size="small" sx={{ bgcolor: r.tagColor, color: 'white', fontWeight: 600, fontSize: '0.62rem', height: 20 }} />
                  {r.orgs?.map((o) => <Chip key={o} label={o} size="small" sx={{ bgcolor: '#F0D9B0', color: '#6B4226', fontSize: '0.62rem', height: 20 }} />)}
                  {r.isNew && <Chip label="NEW" size="small" sx={{ bgcolor: '#C1440E', color: 'white', fontWeight: 700, fontSize: '0.6rem', height: 20 }} />}
                  {r.isUpdated && <Chip label="UPDATED" size="small" sx={{ bgcolor: '#2E7BB4', color: 'white', fontWeight: 700, fontSize: '0.6rem', height: 20 }} />}
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: '#3D2B1F', mb: 0.6 }}>{r.title}</Typography>
                <Typography sx={{ fontSize: '0.8rem', color: '#5A5A5A', lineHeight: 1.6, mb: 1 }}>{r.desc}</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                  <Typography sx={{ fontSize: '0.68rem', color: '#9A9A9A' }}>{r.date}{r.size ? ` · ${r.size}` : ''}</Typography>
                  <Button
                    size="small"
                    variant="contained"
                    component={r.fileUrl ? 'a' : 'button'}
                    href={r.fileUrl || undefined}
                    target={r.fileUrl ? '_blank' : undefined}
                    rel={r.fileUrl ? 'noopener noreferrer' : undefined}
                    disabled={!r.fileUrl}
                    sx={{ bgcolor: '#3D2B1F', '&:hover': { bgcolor: '#C1440E' }, fontSize: '0.72rem' }}
                  >
                    Download
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 4 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, val) => { setPage(val); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              shape="rounded"
              sx={{
                '& .MuiPaginationItem-root': { fontFamily: '"Montserrat", sans-serif', fontSize: '0.82rem' },
                '& .MuiPaginationItem-root.Mui-selected': { bgcolor: '#C1440E', color: 'white', '&:hover': { bgcolor: '#A33A0C' } },
              }}
            />
          </Box>
        )}
      </Box>
    </Layout>
  );
}

export async function getStaticProps() {
  const { data, apiStale } = await getReports();
  return { props: { reports: data, apiStale }, revalidate: 300 };
}
