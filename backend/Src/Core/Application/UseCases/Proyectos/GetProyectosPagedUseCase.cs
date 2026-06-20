

using Application.Common.Models;
using AutoMapper;
using Domain.Interfaces;
using Domain.Interfaces.Repositories;

namespace Application.UseCases.Proyectos
{
    public interface IGetProyectosPagedUseCase : IUseCase
    {
        Task<PagedResult<ProyectoDto>> Execute(GetProyectosPagedRequest request);
    }
    public class GetProyectosPagedUseCase : IGetProyectosPagedUseCase
    {
        private readonly IProyectoRepository _repo;
        private readonly IMapper _mapper;

        public GetProyectosPagedUseCase(IProyectoRepository repo, IMapper mapper)
        {
            _repo = repo;
            _mapper = mapper;
        }
        public async Task<PagedResult<ProyectoDto>> Execute(GetProyectosPagedRequest request)
        {
            var pagina = request.Pagina < 1 ? 1 : request.Pagina;
            var tamanoPagina = request.TamanoPagina < 1 ? 10 : request.TamanoPagina;

            var (items, total) = await _repo.GetPagedAsync(pagina, tamanoPagina);

            return new PagedResult<ProyectoDto>
            {
                Items = _mapper.Map<IEnumerable<ProyectoDto>>(items),
                Total = total,
                Pagina = pagina,
                TamanoPagina = tamanoPagina
            };
        }
    }
}
