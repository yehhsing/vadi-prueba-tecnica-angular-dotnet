using Application.Common.Models;
using Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.UseCases.Proyectos
{
    // Required use cases:
    //   IGetProyectosPagedUseCase  — paginated list
    //   IGetProyectoByIdUseCase    — single project by id
    //   ICreateProyectoUseCase     — create (Admin only)
    //   IUpdateProyectoUseCase     — update (Admin only)
    //   IDeleteProyectoUseCase     — delete with business rule validation (Admin only)
    //
    // Business rules to enforce:
    //   - Cannot delete a project that has tasks in 'Pendiente' or 'En Progreso' state
    //   - Completing a project requires all its tasks to be 'Completada' or 'Cancelada'

    public interface IProyectoUseCases : IUseCase
    {
        Task<PagedResult<ProyectoDto>> GetPagedAsync(int page, int pageSize);
        Task<ProyectoDto?> GetByIdAsync(int id);
        Task<int> CreateAsync(CreateProyectoRequest dto);
        Task<bool> UpdateAsync(int id, UpdateProyectoRequest dto);
        Task<bool> DeleteAsync(int id);
    }
}
