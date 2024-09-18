import { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import axios from 'axios';
import 'primereact/resources/themes/saga-blue/theme.css';  // PrimeReact theme
import 'primereact/resources/primereact.min.css';          // PrimeReact core css
import 'primeicons/primeicons.css';                        // PrimeReact icons

const ArtworksTable = () => {
  const [artworks, setArtworks] = useState<any[]>([]);            // Artworks data for the current page
  const [selectedRows, setSelectedRows] = useState<any[]>([]);    // Rows currently selected on the current page
  const [selectedRowIds, setSelectedRowIds] = useState<Set<number>>(new Set()); // Set of selected row IDs (persistent)
  const [page, setPage] = useState(1); // Current page
  const [totalRecords, setTotalRecords] = useState(0); // Total number of records
  const rowsPerPage = 10; // Number of rows per page

  // Fetch data from the API when the component loads and when the page changes
  useEffect(() => {
    fetchArtworks(page);
  }, [page]);

  // Function to fetch artworks from the API
  const fetchArtworks = async (page: number) => {
    try {
      const response = await axios.get(`https://api.artic.edu/api/v1/artworks?page=${page}&limit=${rowsPerPage}`);
      const fetchedArtworks = response.data.data;

      // Mark previously selected rows based on IDs stored in selectedRowIds
      const previouslySelectedRows = fetchedArtworks.filter((artwork: any) => selectedRowIds.has(artwork.id));

      setArtworks(fetchedArtworks);
      setSelectedRows(previouslySelectedRows); // Set selected rows for current page
      setTotalRecords(response.data.pagination.total); // Set total records for pagination
    } catch (error) {
      console.error('Error fetching artworks:', error);
    }
  };

  // Handle page change for server-side pagination
  const onPageChange = (event: any) => {
    setPage(event.page + 1); // PrimeReact pagination is zero-indexed, so we need to add 1 to match the API
  };

  // Handle row selection and deselection
  const onRowSelect = (e: any) => {
    const selectedRowId = e.data.id;
    setSelectedRowIds((prevSelectedRowIds) => new Set(prevSelectedRowIds.add(selectedRowId))); // Add selected row ID to set
  };

  const onRowUnselect = (e: any) => {
    const unselectedRowId = e.data.id;
    setSelectedRowIds((prevSelectedRowIds) => {
      const newSelectedRowIds = new Set(prevSelectedRowIds);
      newSelectedRowIds.delete(unselectedRowId); // Remove unselected row ID from set
      return newSelectedRowIds;
    });
  };

  const onAllRowsSelect = (e: any) => {
    const selectedIds = e.value.map((row: any) => row.id); // Get the IDs of all selected rows
    setSelectedRowIds((prevSelectedRowIds) => {
      const newSelectedRowIds = new Set(prevSelectedRowIds);
      selectedIds.forEach((id: number) => newSelectedRowIds.add(id)); // Add selected row IDs to set
      return newSelectedRowIds;
    });
  };

  const onAllRowsUnselect = (e: any) => {
    const unselectedIds = e.value.map((row: any) => row.id); // Get the IDs of all unselected rows
    setSelectedRowIds((prevSelectedRowIds) => {
      const newSelectedRowIds = new Set(prevSelectedRowIds);
      unselectedIds.forEach((id: number) => newSelectedRowIds.delete(id)); // Remove unselected row IDs from set
      return newSelectedRowIds;
    });
  };

  return (
    <div className="artworks-table">
      <DataTable
        value={artworks}
        paginator
        rows={rowsPerPage}
        totalRecords={totalRecords}
        lazy
        onPage={onPageChange}
        selection={selectedRows}
        onSelectionChange={(e) => setSelectedRows(e.value)}
        dataKey="id" // Use a unique key for selection
        selectionMode="multiple"
        onRowSelect={onRowSelect} // Event for selecting a single row
        onRowUnselect={onRowUnselect} // Event for unselecting a single row
        onSelectAllChange={(e) => e.checked ? onAllRowsSelect(e) : onAllRowsUnselect(e)} // Handle "select all" checkbox
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      >
        <Column selectionMode="multiple" headerStyle={{ width: '3em' }}></Column>
        <Column field="title" header="Title" sortable></Column>
        <Column field="place_of_origin" header="Place of Origin" sortable></Column>
        <Column field="artist_display" header="Artist" sortable></Column>
        <Column field="inscriptions" header="Inscriptions" sortable></Column>
        <Column field="date_start" header="Start Date" sortable></Column>
        <Column field="date_end" header="End Date" sortable></Column>
      </DataTable>
    </div>
  );
};

export default ArtworksTable;
