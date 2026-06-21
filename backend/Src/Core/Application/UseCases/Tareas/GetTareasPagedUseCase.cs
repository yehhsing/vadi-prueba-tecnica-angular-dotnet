using Application.Common.Models;
using AutoMapper;
using Domain.Interfaces;
using Domain.Interfaces.Repositories;

namespace Application.UseCases.Tareas;

public interface IGetTareasPagedUseCase : IUseCase
{
    Task<PagedResult<TareaDto>> Execute(GetTareasPagedRequest request);
}

public class GetTareasPagedUseCase : IGetTareasPagedUseCase
{
    private readonly ITareaRepository _repo;
    private readonly IMapper _mapper;

    public GetTareasPagedUseCase(ITareaRepository repo, IMapper mapper)
    {
        _repo = repo;
        _mapper = mapper;
    }

    public async Task<PagedResult<TareaDto>> Execute(GetTareasPagedRequest request)
    {
        var pagina = request.Pagina < 1 ? 1 : request.Pagina;
        var tamanoPagina = request.TamanoPagina < 1 ? 10 : request.TamanoPagina;

        var (items, total) = await _repo.GetPagedByProyectoAsync(
            request.ProyectoId,
            pagina,
            tamanoPagina
        );

        return new PagedResult<TareaDto>
        {
            Items = _mapper.Map<IEnumerable<TareaDto>>(items),
            Total = total,
            Pagina = pagina,
            TamanoPagina = tamanoPagina
        };
    }
}
